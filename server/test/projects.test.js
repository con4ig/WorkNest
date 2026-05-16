import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import Project from "../models/Project.js";
import { createTenant, bearer } from "./helpers.js";

describe("POST /api/projects (RBAC)", () => {
  it("lets an admin create a project", async () => {
    const { token } = await createTenant({ role: "admin" });

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", bearer(token))
      .send({ name: "Q3 Planning", priority: "high" });

    expect(res.status).toBe(201);
    expect(res.body.project).toMatchObject({
      name: "Q3 Planning",
      priority: "high",
    });
  });

  it("forbids an employee from creating a project (403)", async () => {
    const { token } = await createTenant({ role: "employee" });

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", bearer(token))
      .send({ name: "Sneaky project" });

    expect(res.status).toBe(403);
    // No project leaked into the collection.
    expect(await Project.countDocuments({})).toBe(0);
  });
});

describe("Multi-tenant isolation", () => {
  it("hides a project belonging to another company (404 on GET by id)", async () => {
    // Tenant A creates a project.
    const a = await createTenant({ role: "admin", companyName: "Alpha" });
    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", bearer(a.token))
      .send({ name: "Alpha secret roadmap" })
      .expect(201);
    const alphaProjectId = created.body.project._id;

    // Tenant B's HR has the literal ObjectId. They must still 404.
    const b = await createTenant({ role: "hr", companyName: "Beta" });
    const probe = await request(app)
      .get(`/api/projects/${alphaProjectId}`)
      .set("Authorization", bearer(b.token));

    expect(probe.status).toBe(404);
    // Defence in depth: the project list for tenant B is empty too.
    const list = await request(app)
      .get("/api/projects")
      .set("Authorization", bearer(b.token))
      .expect(200);
    expect(list.body.count).toBe(0);
    expect(list.body.projects).toEqual([]);
  });
});
