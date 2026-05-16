import express from "express";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = express.Router();

/**
 * @openapi
 * /api/tasks/project/{projectId}:
 *   get:
 *     tags: [Tasks]
 *     summary: List all tasks belonging to a project
 *     description: |
 *       Tenant-scoped: the parent project must belong to the caller's company
 *       (or caller must be superadmin). Tasks are sorted by Kanban `order`,
 *       then by recency.
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task list.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Task' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/project/:projectId", authenticate, getTasksByProject);

// POST - Create new task
import { limitDemoResources } from "../middleware/limitDemoResources.js";

/**
 * @openapi
 * /api/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a task on a project (admin/hr)
 *     description: |
 *       Records a `task_created` activity entry for the audit log.
 *       Demo tenants are capped — see ADR-0004.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, project]
 *             properties:
 *               title:       { type: string }
 *               description: { type: string }
 *               project:
 *                 type: string
 *                 description: ID of the parent project (must be in caller's tenant).
 *               assignedTo:  { type: string, nullable: true }
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               dueDate:     { type: string, format: date-time, nullable: true }
 *     responses:
 *       201:
 *         description: Task created.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Task' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403:
 *         description: Forbidden, or demo tenant limit exceeded.
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.post("/", authenticate, authorize("admin", "hr"), limitDemoResources, createTask);

/**
 * @openapi
 * /api/tasks/{id}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update a task (any authenticated tenant member)
 *     description: |
 *       Open to all roles so employees can drag cards across the Kanban
 *       board. Status transitions emit `task_updated` or, when moving to
 *       `completed`, `task_completed` activity entries and stamp
 *       `completedAt`.
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
 *             properties:
 *               title:       { type: string }
 *               description: { type: string }
 *               status:      { type: string, enum: [todo, in-progress, completed] }
 *               priority:    { type: string, enum: [low, medium, high] }
 *               assignedTo:  { type: string, nullable: true }
 *               dueDate:     { type: string, format: date-time, nullable: true }
 *               order:       { type: integer }
 *     responses:
 *       200:
 *         description: Updated task.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Task' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch("/:id", authenticate, updateTask);

/**
 * @openapi
 * /api/tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task (admin/hr)
 *     description: |
 *       Records a `task_deleted` activity entry before removal so the audit
 *       trail survives the deletion.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task deleted.
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete("/:id", authenticate, authorize("admin", "hr"), deleteTask);

export default router;
