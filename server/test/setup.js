// Test setup — runs once per worker before any test files in that worker.
//
// We boot an in-process MongoDB **replica set** via `mongodb-memory-server`
// (the auth controller uses `session.withTransaction(...)` which is only
// supported on replica sets / mongos), point Mongoose at it, and tear
// everything down at the end. Collections are cleared between tests so
// files / tests cannot pollute each other.
//
// Test-wide env vars (JWT secrets, encryption key) are set here so the
// modules importing them at top-level (authController etc.) see real
// values, not `undefined`.

import { afterAll, afterEach, beforeAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-not-for-prod";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-not-for-prod";
// 64-char hex = 32 bytes — what the User model's encrypt() expects.
process.env.ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(mongo.getUri(), {
    serverSelectionTimeoutMS: 15_000,
  });
});

afterEach(async () => {
  // Reset every collection between tests so each test starts from a clean
  // slate. Cheaper than dropping and recreating the database.
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});
