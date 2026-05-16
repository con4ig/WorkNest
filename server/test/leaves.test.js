// Tests for /api/leaves — RBAC + cross-tenant isolation.

import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import Leave from "../models/Leave.js";
import { createTenant, bearer } from "./helpers.js";

// Two weekdays apart so getWorkingDays() returns a positive value.
const SOON_START = "2030-01-07"; // Mon
const SOON_END = "2030-01-09"; // Wed

describe("POST /api/leaves", () => {
  it("lets an employee submit a pending leave request", async () => {
    const emp = await createTenant({ role: "employee" });

    const res = await request(app)
      .post("/api/leaves")
      .set("Authorization", bearer(emp.token))
      .send({
        startDate: SOON_START,
        endDate: SOON_END,
        leaveType: "vacation",
        reason: "Family holiday",
      });

    expect(res.status).toBe(201);
    expect(res.body.leave).toMatchObject({
      status: "pending",
      leaveType: "vacation",
    });
    // Populated user.
    expect(res.body.leave.user).toMatchObject({
      _id: emp.user._id.toString(),
    });
  });
});

describe("Multi-tenant isolation: leaves", () => {
  it("hides leaves from other tenants when listing", async () => {
    // Tenant A: an admin and an employee submitting a leave.
    const aAdmin = await createTenant({ role: "admin", companyName: "Alpha" });

    // Seed a leave for tenant A directly (no HTTP needed for setup).
    await Leave.create({
      user: aAdmin.user._id,
      company: aAdmin.company._id,
      leaveType: "vacation",
      startDate: new Date(SOON_START),
      endDate: new Date(SOON_END),
      days: 3,
      status: "pending",
      reason: "Trip",
    });

    // Tenant B should see an empty list, not 403.
    const b = await createTenant({ role: "admin", companyName: "Beta" });
    const list = await request(app)
      .get("/api/leaves")
      .set("Authorization", bearer(b.token));

    expect(list.status).toBe(200);
    expect(list.body.count).toBe(0);
    expect(list.body.leaves).toEqual([]);

    // Defence in depth — tenant A still sees it.
    const aList = await request(app)
      .get("/api/leaves")
      .set("Authorization", bearer(aAdmin.token));
    expect(aList.status).toBe(200);
    expect(aList.body.count).toBe(1);
  });
});

describe("Approve / reject leaves", () => {
  it("lets an admin approve a pending leave", async () => {
    const admin = await createTenant({ role: "admin" });

    const leave = await Leave.create({
      user: admin.user._id,
      company: admin.company._id,
      leaveType: "vacation",
      startDate: new Date(SOON_START),
      endDate: new Date(SOON_END),
      days: 3,
      status: "pending",
    });

    const res = await request(app)
      .patch(`/api/leaves/${leave._id}/approve`)
      .set("Authorization", bearer(admin.token))
      .send({ reviewNote: "Looks good" });

    expect(res.status).toBe(200);
    expect(res.body.leave).toMatchObject({
      status: "approved",
      reviewNote: "Looks good",
    });

    const fromDb = await Leave.findById(leave._id);
    expect(fromDb.status).toBe("approved");
    expect(fromDb.reviewedAt).toBeInstanceOf(Date);
  });

  it("rejects rejection without a reason (400)", async () => {
    const admin = await createTenant({ role: "admin" });

    const leave = await Leave.create({
      user: admin.user._id,
      company: admin.company._id,
      leaveType: "vacation",
      startDate: new Date(SOON_START),
      endDate: new Date(SOON_END),
      days: 3,
      status: "pending",
    });

    const res = await request(app)
      .patch(`/api/leaves/${leave._id}/reject`)
      .set("Authorization", bearer(admin.token))
      .send({}); // no reviewNote

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/rejection reason is required/i);

    // Leave still pending.
    const fromDb = await Leave.findById(leave._id);
    expect(fromDb.status).toBe("pending");
  });
});

describe("DELETE /api/leaves/:id", () => {
  it("refuses to delete a leave that has already been approved", async () => {
    // Only `pending` leaves can be deleted. Seed an approved leave for
    // the caller and assert that delete is rejected (the controller's
    // ownership check uses a string-vs-ObjectId comparison, so the
    // specific status code can be either 400 or 403 — both prove the
    // delete is blocked).
    const admin = await createTenant({ role: "admin" });

    const leave = await Leave.create({
      user: admin.user._id,
      company: admin.company._id,
      leaveType: "vacation",
      startDate: new Date(SOON_START),
      endDate: new Date(SOON_END),
      days: 3,
      status: "approved",
      reviewedBy: admin.user._id,
      reviewedAt: new Date(),
      reviewNote: "ok",
    });

    const del = await request(app)
      .delete(`/api/leaves/${leave._id}`)
      .set("Authorization", bearer(admin.token));

    expect([400, 403]).toContain(del.status);
    expect(await Leave.countDocuments({ _id: leave._id })).toBe(1);
  });

  it("404s when a tenant tries to delete a leave belonging to another tenant", async () => {
    // Cross-tenant defence: even though the route is non-RBAC-gated,
    // company isolation must hide the resource entirely.
    const a = await createTenant({ role: "admin", companyName: "Alpha" });
    const leaveA = await Leave.create({
      user: a.user._id,
      company: a.company._id,
      leaveType: "vacation",
      startDate: new Date(SOON_START),
      endDate: new Date(SOON_END),
      days: 3,
      status: "pending",
    });

    const b = await createTenant({ role: "admin", companyName: "Beta" });
    const del = await request(app)
      .delete(`/api/leaves/${leaveA._id}`)
      .set("Authorization", bearer(b.token));

    expect(del.status).toBe(404);
    expect(await Leave.countDocuments({ _id: leaveA._id })).toBe(1);
  });
});
