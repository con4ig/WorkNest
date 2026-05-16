import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../app.js";
import { createTenant } from "./helpers.js";

describe("POST /api/auth/register", () => {
  it("registers an admin together with a new company", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "alice.admin",
      email: "alice@example.com",
      password: "supersecret",
      role: "admin",
      companyName: "Alice Co",
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      user: { username: "alice.admin", role: "admin" },
      company: { name: "Alice Co" },
    });
    expect(res.body.message).toMatch(/registered successfully/i);
  });

  it("rejects a payload missing required fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "x@y.z" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it("rejects a duplicate email with 409", async () => {
    const payload = {
      username: "bob",
      email: "bob@example.com",
      password: "supersecret",
      role: "admin",
      companyName: "Bob Co",
    };
    await request(app).post("/api/auth/register").send(payload).expect(201);

    const dup = await request(app).post("/api/auth/register").send({
      ...payload,
      username: "bob-the-second",
      companyName: "Bob Co 2",
    });

    expect(dup.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  it("returns an access token + refresh cookie for valid credentials", async () => {
    const { user, password } = await createTenant({ role: "admin" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ email: user.email, role: "admin" });

    const cookies = res.headers["set-cookie"] || [];
    expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
    expect(cookies.some((c) => /HttpOnly/i.test(c))).toBe(true);
  });

  it("rejects invalid credentials with 401 and no token", async () => {
    const { user } = await createTenant({ role: "admin" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.accessToken).toBeUndefined();
  });
});

describe("POST /api/auth/refresh", () => {
  it("issues a new access token when given a valid refresh cookie", async () => {
    const { user, password } = await createTenant({ role: "admin" });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password })
      .expect(200);

    const cookie = login.headers["set-cookie"].find((c) =>
      c.startsWith("refreshToken=")
    );

    const refresh = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookie);

    expect(refresh.status).toBe(200);
    expect(refresh.body.accessToken).toEqual(expect.any(String));

    // The new token must be a valid JWT signed by our server, carrying
    // the same user identity. Asserting inequality with the login token
    // is flaky because JWTs minted within the same second share `iat`.
    const decoded = jwt.verify(
      refresh.body.accessToken,
      process.env.JWT_SECRET
    );
    expect(decoded._id).toBe(String(user._id));
    expect(decoded.role).toBe("admin");
  });
});
