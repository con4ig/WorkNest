// Tests for /api/tasks — RBAC happy paths + cross-tenant isolation.
//
// The task POST route gates on `authorize("admin", "hr")`, so the non-admin
// happy path here is HR (not employee, despite the rough spec wording).
// Employees can still update tasks (PATCH has no role gate), but cannot
// create — that's enforced by the route, not the controller.

import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { createTenant, bearer } from "./helpers.js";

/**
 * Seed a project owned by the given tenant. Bypasses HTTP so we don't
 * depend on the projects controller behaviour mid-test.
 */
async function seedProject(tenant, name = "Test Project") {
  return Project.create({
    name,
    company: tenant.company._id,
    createdBy: tenant.user._id,
  });
}

describe("POST /api/tasks (RBAC)", () => {
  it("lets an admin create a task on their project", async () => {
    const admin = await createTenant({ role: "admin" });
    const project = await seedProject(admin);

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", bearer(admin.token))
      .send({
        title: "Write spec",
        project: project._id.toString(),
        priority: "high",
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: "Write spec",
      priority: "high",
      status: "todo",
    });
    expect(res.body.company).toBe(admin.company._id.toString());
  });

  it("lets HR (non-admin, same company) create a task", async () => {
    // The route gate is authorize("admin", "hr") — so HR is the
    // realistic "non-admin same company" happy path.
    const admin = await createTenant({ role: "admin", companyName: "Acme" });
    const project = await seedProject(admin);

    // Add an HR user to the same company.
    const hr = await createTenant({
      role: "hr",
      companyName: "Acme HR slot",
    });
    // Re-seat the HR user inside the admin's company.
    const User = (await import("../models/User.js")).default;
    await User.updateOne(
      { _id: hr.user._id },
      { company: admin.company._id }
    );
    // Re-sign HR's token so the JWT's `company` claim matches.
    const jwt = (await import("jsonwebtoken")).default;
    const hrToken = jwt.sign(
      {
        _id: hr.user._id,
        email: hr.user.email,
        role: "hr",
        company: admin.company._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", bearer(hrToken))
      .send({
        title: "HR task",
        project: project._id.toString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("HR task");
  });
});

describe("Multi-tenant isolation: tasks", () => {
  it("blocks a user from company B from creating a task on company A's project (404)", async () => {
    const a = await createTenant({ role: "admin", companyName: "Alpha" });
    const projectA = await seedProject(a, "Alpha roadmap");

    const b = await createTenant({ role: "admin", companyName: "Beta" });

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", bearer(b.token))
      .send({
        title: "Sneak attack",
        project: projectA._id.toString(),
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found or access denied/i);

    // Defence in depth — nothing leaked into the Task collection.
    expect(await Task.countDocuments({})).toBe(0);
  });

  it("blocks a user from company B from reading tasks for company A's project (404)", async () => {
    const a = await createTenant({ role: "admin", companyName: "Alpha" });
    const projectA = await seedProject(a, "Alpha roadmap");

    // Seed a task on tenant A's project directly.
    await Task.create({
      title: "Alpha-only task",
      project: projectA._id,
      company: a.company._id,
      createdBy: a.user._id,
    });

    const b = await createTenant({ role: "admin", companyName: "Beta" });

    const probe = await request(app)
      .get(`/api/tasks/project/${projectA._id}`)
      .set("Authorization", bearer(b.token));

    expect(probe.status).toBe(404);
    expect(probe.body.message).toMatch(/not found or access denied/i);

    // Defence in depth — tenant A still sees the task.
    const aView = await request(app)
      .get(`/api/tasks/project/${projectA._id}`)
      .set("Authorization", bearer(a.token));
    expect(aView.status).toBe(200);
    expect(Array.isArray(aView.body)).toBe(true);
    expect(aView.body).toHaveLength(1);
    expect(aView.body[0].title).toBe("Alpha-only task");
  });
});

describe("PATCH /api/tasks/:id status=completed", () => {
  it("sets completedAt when status flips to completed", async () => {
    const admin = await createTenant({ role: "admin" });
    const project = await seedProject(admin);

    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", bearer(admin.token))
      .send({
        title: "Finishable",
        project: project._id.toString(),
      })
      .expect(201);

    expect(created.body.completedAt).toBeFalsy();

    const updated = await request(app)
      .patch(`/api/tasks/${created.body._id}`)
      .set("Authorization", bearer(admin.token))
      .send({ status: "completed" });

    expect(updated.status).toBe(200);
    expect(updated.body.status).toBe("completed");
    expect(updated.body.completedAt).toEqual(expect.any(String));

    // Defence in depth — fetch back from the DB.
    const fromDb = await Task.findById(created.body._id);
    expect(fromDb.completedAt).toBeInstanceOf(Date);
  });
});
