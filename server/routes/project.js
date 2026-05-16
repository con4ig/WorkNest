import express from "express";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import { limitDemoResources } from "../middleware/limitDemoResources.js";
import {
  updateProjectUsers,
  getProjects,
  getProjectStats,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getUserAssignedProjectsSummary,
  getStatsSummary,
  archiveProject,
  restoreProject,
  updateProjectStatus,
  bulkProjectAction,
  getWeeklyActivity,
} from "../controllers/projectController.js";

const router = express.Router();

/**
 * @openapi
 * /api/projects/{id}/users:
 *   patch:
 *     tags: [Projects]
 *     summary: Add or remove a user from a project (admin/hr)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, action]
 *             properties:
 *               userId: { type: string }
 *               action: { type: string, enum: [add, remove] }
 *     responses:
 *       200:
 *         description: Updated project with populated users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 project: { $ref: '#/components/schemas/Project' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch(
  "/:id/users",
  authenticate,
  authorize("admin", "hr"),
  updateProjectUsers
);

/**
 * @openapi
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: List projects visible to the caller (tenant-scoped)
 *     description: |
 *       Employees see only projects they are assigned to.
 *       HR/admin see all projects in their company.
 *       Superadmin sees all projects across all tenants.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, running, completed, on-hold] }
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Case-insensitive partial match on project name.
 *       - in: query
 *         name: isArchived
 *         schema: { type: boolean }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: ['createdAt:desc', 'name:asc'] }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Paginated project list.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProjectListResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get("/", authenticate, getProjects);

/**
 * @openapi
 * /api/projects/stats:
 *   get:
 *     tags: [Projects]
 *     summary: Aggregate counts by project status (for the dashboard)
 *     responses:
 *       200:
 *         description: Status counts.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProjectStats' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get("/stats", authenticate, getProjectStats);

/**
 * @openapi
 * /api/projects/stats/weekly-activity:
 *   get:
 *     tags: [Projects]
 *     summary: Project creation counts for the last 8 days (timezone Europe/Warsaw)
 *     responses:
 *       200:
 *         description: Per-day counts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:  { type: string, format: date }
 *                   count: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get("/stats/weekly-activity", authenticate, getWeeklyActivity);

/**
 * @openapi
 * /api/projects/bulk-action:
 *   patch:
 *     tags: [Projects]
 *     summary: Apply an action to many projects at once (admin/hr)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectIds, action]
 *             properties:
 *               projectIds:
 *                 type: array
 *                 items: { type: string }
 *               action:
 *                 type: string
 *                 enum: [archive, restore, delete, status]
 *               payload:
 *                 type: object
 *                 description: 'For `action: status`, must contain `{ status }`.'
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [pending, running, completed, on-hold]
 *     responses:
 *       200:
 *         description: Bulk operation completed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 count:   { type: integer }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.patch(
  "/bulk-action",
  authenticate,
  authorize("admin", "hr"),
  bulkProjectAction
);

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get a single project (tenant-scoped; employees only if assigned)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project document with populated users and creator.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Project' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/:id", authenticate, getProjectById);

/**
 * @openapi
 * /api/projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a project (admin/hr). Demo tenants are capped — see ADR-0004.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:        { type: string }
 *               description: { type: string }
 *               status:
 *                 type: string
 *                 enum: [pending, running, completed, on-hold]
 *                 default: pending
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               startDate: { type: string, format: date-time }
 *               endDate:   { type: string, format: date-time }
 *               assignedUsers:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201:
 *         description: Project created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 project: { $ref: '#/components/schemas/Project' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403:
 *         description: Forbidden, or demo tenant limit exceeded.
 */
router.post(
  "/",
  authenticate,
  authorize("admin", "hr"),
  limitDemoResources,
  createProject
);

/**
 * @openapi
 * /api/projects/{id}:
 *   patch:
 *     tags: [Projects]
 *     summary: Partially update a project (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Project' }
 *     responses:
 *       200:
 *         description: Updated project.
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: [Projects]
 *     summary: Hard-delete a project (admin only). Prefer archive — see ADR-0008.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project removed.
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch("/:id", authenticate, authorize("admin"), updateProject);
router.delete("/:id", authenticate, authorize("admin"), deleteProject);

/**
 * @openapi
 * /api/projects/users/{userId}/assigned-projects/summary:
 *   get:
 *     tags: [Projects]
 *     summary: Counts of active projects assigned to a given user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Status counts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assigned:  { type: integer }
 *                 completed: { type: integer }
 *                 running:   { type: integer }
 *                 pending:   { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get(
  "/users/:userId/assigned-projects/summary",
  authenticate,
  getUserAssignedProjectsSummary
);

/**
 * @openapi
 * /api/projects/stats/summary:
 *   get:
 *     tags: [Projects]
 *     summary: Per-company stats (admin/hr)
 *     responses:
 *       200:
 *         description: Status counts.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProjectStats' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get(
  "/stats/summary",
  authenticate,
  authorize("admin", "hr"),
  getStatsSummary
);

/**
 * @openapi
 * /api/projects/{id}/archive:
 *   patch:
 *     tags: [Projects]
 *     summary: Soft-delete a project (admin/hr) — sets `isArchived = true`. See ADR-0008.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project archived.
 */
router.patch(
  "/:id/archive",
  authenticate,
  authorize("admin", "hr"),
  archiveProject
);

/**
 * @openapi
 * /api/projects/{id}/restore:
 *   patch:
 *     tags: [Projects]
 *     summary: Restore an archived project (admin/hr)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project restored.
 */
router.patch(
  "/:id/restore",
  authenticate,
  authorize("admin", "hr"),
  restoreProject
);

/**
 * @openapi
 * /api/projects/{id}/status:
 *   patch:
 *     tags: [Projects]
 *     summary: Quick status change (Kanban drag & drop) (admin/hr)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, running, completed, on-hold]
 *     responses:
 *       200:
 *         description: Status updated.
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin", "hr"),
  updateProjectStatus
);

export default router;
