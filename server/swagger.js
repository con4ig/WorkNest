import swaggerJSDoc from "swagger-jsdoc";

const isProd = process.env.NODE_ENV === "production";

const servers = [
  { url: "http://localhost:5500", description: "Local development" },
];

if (process.env.PUBLIC_API_URL) {
  servers.unshift({
    url: process.env.PUBLIC_API_URL,
    description: isProd ? "Production" : "Deployed",
  });
}

const definition = {
  openapi: "3.0.3",
  info: {
    title: "WorkNest API",
    version: "1.0.0",
    description:
      "REST API for WorkNest — an all-in-one HR & project management platform. " +
      "Authentication uses a short-lived JWT access token (15 min) returned in the " +
      "response body and a longer-lived refresh token (7 days) set as an `httpOnly` " +
      "cookie. See [ADR-0001](https://github.com/) for the rationale.",
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
    contact: {
      name: "WorkNest",
      url: "https://worknest-1.onrender.com",
    },
  },
  servers,
  tags: [
    { name: "Auth", description: "Registration, login, refresh, demo sandbox" },
    { name: "Projects", description: "Project CRUD, archive, bulk actions" },
    { name: "Tasks", description: "Project tasks" },
    { name: "Comments", description: "Project comments and replies" },
    { name: "Leaves", description: "Leave requests and approvals" },
    { name: "Users", description: "User management, invitations" },
    { name: "Activities", description: "Audit log per project" },
    { name: "Health", description: "Liveness and readiness" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Short-lived access token. Obtain via `POST /api/auth/login` or " +
          "`POST /api/auth/demo-login`, refresh via `POST /api/auth/refresh`.",
      },
      refreshCookie: {
        type: "apiKey",
        in: "cookie",
        name: "refreshToken",
        description: "httpOnly cookie set by login; used only by `/refresh` and `/logout`.",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          message: { type: "string", example: "Invalid credentials" },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "65f1e3a4b8c9d2e3f4a5b6c7" },
          username: { type: "string", example: "jane.doe" },
          email: { type: "string", format: "email", example: "jane@example.com" },
          role: {
            type: "string",
            enum: ["employee", "hr", "admin", "superadmin"],
            example: "hr",
          },
          company: { type: "string", example: "65f1e3a4b8c9d2e3f4a5b6c8" },
          profileImage: { type: "string", example: "" },
          mustChangePassword: { type: "boolean", example: false },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Logged in successfully" },
          accessToken: { type: "string", description: "JWT, expires in 15 minutes" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      Project: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string", example: "Q3 onboarding revamp" },
          description: { type: "string" },
          status: {
            type: "string",
            enum: ["pending", "running", "completed", "on-hold"],
            example: "running",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            example: "medium",
          },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          progress: { type: "integer", minimum: 0, maximum: 100, example: 75 },
          isArchived: { type: "boolean", example: false },
          assignedUsers: {
            type: "array",
            items: { $ref: "#/components/schemas/User" },
          },
          createdBy: { $ref: "#/components/schemas/User" },
          company: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProjectListResponse: {
        type: "object",
        properties: {
          count: { type: "integer", example: 7 },
          projects: {
            type: "array",
            items: { $ref: "#/components/schemas/Project" },
          },
        },
      },
      ProjectStats: {
        type: "object",
        properties: {
          total: { type: "integer", example: 12 },
          pending: { type: "integer", example: 3 },
          running: { type: "integer", example: 6 },
          completed: { type: "integer", example: 3 },
        },
      },
      Leave: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
          leaveType: {
            type: "string",
            enum: [
              "vacation",
              "on_demand",
              "sick",
              "maternity",
              "paternity",
              "parental",
              "childcare",
              "occasional",
              "care",
              "training",
              "unpaid",
              "job_search",
              "health",
              "other",
            ],
          },
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date" },
          days: { type: "integer", example: 5 },
          reason: { type: "string" },
          status: {
            type: "string",
            enum: ["pending", "approved", "rejected"],
            example: "pending",
          },
          reviewedBy: { $ref: "#/components/schemas/User" },
          reviewedAt: { type: "string", format: "date-time" },
          reviewNote: { type: "string" },
        },
      },
      Task: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          status: {
            type: "string",
            enum: ["todo", "in-progress", "completed"],
          },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          dueDate: { type: "string", format: "date-time" },
          assignedTo: { $ref: "#/components/schemas/User" },
          createdBy: { $ref: "#/components/schemas/User" },
          project: { type: "string" },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "Missing or invalid token.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      Forbidden: {
        description: "Authenticated but not permitted (RBAC or tenant isolation).",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      NotFound: {
        description: "Resource does not exist or is invisible to this tenant.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      ValidationError: {
        description: "Request body failed validation.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const swaggerSpec = swaggerJSDoc({
  definition,
  apis: ["./routes/*.js", "./server.js"],
});

export default swaggerSpec;
