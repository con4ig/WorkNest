// Shared test helpers.

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";

/**
 * Provision a fresh tenant + a user inside it, returning both Mongo
 * documents and a signed access token for that user.
 *
 * Usage:
 *   const { user, company, token } = await createTenant({ role: "admin" });
 *   await request(app).post("/api/projects").set(...).send(...)
 */
export async function createTenant({
  role = "admin",
  email,
  username,
  password = "test-password-1",
  companyName,
} = {}) {
  const suffix = Math.random().toString(36).slice(2, 8);

  // The Company schema requires `owner`, and the User schema requires
  // `company`. Resolve the cycle by allocating IDs up-front.
  const userId = new mongoose.Types.ObjectId();
  const companyId = new mongoose.Types.ObjectId();

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    _id: userId,
    username: username || `user-${suffix}`,
    email: email || `user-${suffix}@example.com`,
    password: hashed,
    role,
    company: companyId,
  });

  await Company.create({
    _id: companyId,
    name: companyName || `Test Co ${suffix}`,
    invitationCode: `inv-${suffix}`,
    owner: userId,
  });

  const user = await User.findById(userId);
  const company = await Company.findById(companyId);

  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
      company: company._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  return { user, company, token, password };
}

/** Convenience wrapper for Authorization header assembly. */
export const bearer = (token) => `Bearer ${token}`;
