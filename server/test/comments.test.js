// Tests for /api/comments — RBAC happy paths + cross-tenant isolation.

import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import Project from "../models/Project.js";
import Comment from "../models/Comment.js";
import { createTenant, bearer } from "./helpers.js";

async function seedProject(tenant, name = "Test Project") {
  return Project.create({
    name,
    company: tenant.company._id,
    createdBy: tenant.user._id,
  });
}

describe("POST /api/comments", () => {
  it("lets an admin post a comment with a populated author", async () => {
    const admin = await createTenant({ role: "admin" });
    const project = await seedProject(admin);

    const res = await request(app)
      .post("/api/comments")
      .set("Authorization", bearer(admin.token))
      .send({
        content: "First!",
        project: project._id.toString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.content).toBe("First!");
    // Author should be populated (object with username/email), not a raw id.
    expect(res.body.author).toMatchObject({
      _id: admin.user._id.toString(),
      username: admin.user.username,
      email: admin.user.email,
    });
  });
});

describe("Multi-tenant isolation: comments", () => {
  it("blocks a user from company B from commenting on company A's project (404)", async () => {
    const a = await createTenant({ role: "admin", companyName: "Alpha" });
    const projectA = await seedProject(a, "Alpha roadmap");

    const b = await createTenant({ role: "admin", companyName: "Beta" });

    const res = await request(app)
      .post("/api/comments")
      .set("Authorization", bearer(b.token))
      .send({
        content: "intrusion attempt",
        project: projectA._id.toString(),
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found or access denied/i);

    // Defence in depth — nothing leaked into the Comment collection.
    expect(await Comment.countDocuments({})).toBe(0);

    // And: B querying the comments list for A's project should also 404.
    const list = await request(app)
      .get(`/api/comments/project/${projectA._id}`)
      .set("Authorization", bearer(b.token));
    expect(list.status).toBe(404);
  });
});

describe("DELETE /api/comments/:id", () => {
  it("lets a user delete their own comment", async () => {
    const admin = await createTenant({ role: "admin" });
    const project = await seedProject(admin);

    const created = await request(app)
      .post("/api/comments")
      .set("Authorization", bearer(admin.token))
      .send({
        content: "self-delete me",
        project: project._id.toString(),
      })
      .expect(201);

    const del = await request(app)
      .delete(`/api/comments/${created.body._id}`)
      .set("Authorization", bearer(admin.token));

    expect(del.status).toBe(200);
    expect(del.body.message).toMatch(/deleted/i);
    expect(await Comment.countDocuments({})).toBe(0);
  });

  it("forbids a non-admin from deleting someone else's comment (403)", async () => {
    // Tenant: one company, two users — owner (admin) and an HR user.
    const owner = await createTenant({ role: "admin", companyName: "Acme" });
    const project = await seedProject(owner);

    // Owner authors the comment.
    const created = await request(app)
      .post("/api/comments")
      .set("Authorization", bearer(owner.token))
      .send({
        content: "owner's comment",
        project: project._id.toString(),
      })
      .expect(201);

    // Create an HR user inside the same company. We splice them in
    // directly so they share the company id.
    const hr = await createTenant({ role: "hr", companyName: "HR placeholder" });
    const User = (await import("../models/User.js")).default;
    await User.updateOne(
      { _id: hr.user._id },
      { company: owner.company._id }
    );
    const jwt = (await import("jsonwebtoken")).default;
    const hrToken = jwt.sign(
      {
        _id: hr.user._id,
        email: hr.user.email,
        role: "hr",
        company: owner.company._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const del = await request(app)
      .delete(`/api/comments/${created.body._id}`)
      .set("Authorization", bearer(hrToken));

    expect(del.status).toBe(403);
    expect(del.body.message).toMatch(/insufficient permissions/i);

    // Defence in depth — comment still there.
    expect(await Comment.countDocuments({ _id: created.body._id })).toBe(1);
  });
});
