import express from "express";
import Authenticate from "../middleware/authenticate.js";
import {
  getActivitiesByProject,
  createActivity,
} from "../controllers/activityController.js";

const router = express.Router();

/**
 * @openapi
 * /api/activities/project/{projectId}:
 *   get:
 *     tags: [Activities]
 *     summary: Paginated audit log for a single project
 *     description: |
 *       Tenant-scoped (ADR-0002). Returns audit entries (task/comment/project
 *       lifecycle events) for one project, newest first, with pagination
 *       metadata for infinite-scroll UIs.
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, default: 50 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *     responses:
 *       200:
 *         description: Activity page.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:         { type: string }
 *                       project:     { type: string }
 *                       user:        { $ref: '#/components/schemas/User' }
 *                       action:      { type: string, example: task_completed }
 *                       description: { type: string }
 *                       metadata:    { type: object, additionalProperties: true }
 *                       createdAt:   { type: string, format: date-time }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     page:  { type: integer }
 *                     limit: { type: integer }
 *                     pages: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/project/:projectId", Authenticate, getActivitiesByProject);

/**
 * @openapi
 * /api/activities:
 *   post:
 *     tags: [Activities]
 *     summary: Manually record an audit entry against a project
 *     description: |
 *       Most activity rows are emitted server-side by task/comment/project
 *       controllers. This endpoint exists as an escape hatch for ad-hoc
 *       events the UI wants to log directly.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [project, action, description]
 *             properties:
 *               project:
 *                 type: string
 *                 description: ID of the project (must be in caller's tenant).
 *               action:
 *                 type: string
 *                 description: 'Short machine-readable verb, e.g. "task_created".'
 *               description: { type: string }
 *               metadata:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       201:
 *         description: Activity recorded.
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.post("/", Authenticate, createActivity);

export default router;
