import express from "express";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import {
  getLeaves,
  getMyLeaves,
  createLeave,
  approveLeave,
  rejectLeave,
  deleteLeave,
} from "../controllers/leaveController.js";

const router = express.Router();

/**
 * @openapi
 * /api/leaves:
 *   get:
 *     tags: [Leaves]
 *     summary: List leave requests visible to the caller (tenant-scoped)
 *     description: |
 *       Employees see only their own requests. HR/admin see all requests in
 *       their company. Superadmin sees everything across tenants.
 *       Each `user` is enriched with `stats.usedDaysThisYear` (approved leave
 *       days consumed in the current calendar year).
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, rejected] }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: HR/admin only — narrow the result set to one employee.
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Case-insensitive partial match on username or email.
 *     responses:
 *       200:
 *         description: Leave list with usage stats per user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer }
 *                 leaves:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Leave' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get("/", authenticate, getLeaves);

/**
 * @openapi
 * /api/leaves/my:
 *   get:
 *     tags: [Leaves]
 *     summary: List the caller's own leave requests with summary stats
 *     description: |
 *       Dedicated endpoint for the employee dashboard. Computes working-day
 *       counts (excluding weekends) on the fly so the UI can render badges
 *       without a second round-trip.
 *     responses:
 *       200:
 *         description: Caller's leaves plus per-status counters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 leaves:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Leave' }
 *                 stats:
 *                   type: object
 *                   properties:
 *                     pending:   { type: integer }
 *                     approved:  { type: integer }
 *                     rejected:  { type: integer }
 *                     totalDays: { type: integer, description: "Approved working days used." }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get("/my", authenticate, getMyLeaves);

// POST /api/leaves - create leave request
import { limitDemoResources } from "../middleware/limitDemoResources.js";

/**
 * @openapi
 * /api/leaves:
 *   post:
 *     tags: [Leaves]
 *     summary: Submit a new leave request (status starts as `pending`)
 *     description: |
 *       Working-day count is computed server-side (Mon-Fri only); requests
 *       where end-date is not after start-date are rejected with 400.
 *       Demo tenants are capped — see ADR-0004.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [startDate, endDate]
 *             properties:
 *               leaveType:
 *                 type: string
 *                 enum: [vacation, on_demand, sick, maternity, paternity, parental, childcare, occasional, care, training, unpaid, job_search, health, other]
 *                 default: vacation
 *               startDate: { type: string, format: date }
 *               endDate:   { type: string, format: date }
 *               reason:    { type: string }
 *     responses:
 *       201:
 *         description: Leave request created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 leave:   { $ref: '#/components/schemas/Leave' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403:
 *         description: Forbidden, or demo tenant limit exceeded.
 */
router.post("/", authenticate, limitDemoResources, createLeave);

/**
 * @openapi
 * /api/leaves/{id}/approve:
 *   patch:
 *     tags: [Leaves]
 *     summary: Approve a pending leave request (hr/admin)
 *     description: |
 *       Sets `status: approved`, stamps `reviewedBy` and `reviewedAt`, and
 *       optionally records an internal note for the audit trail.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reviewNote: { type: string }
 *     responses:
 *       200:
 *         description: Leave approved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 leave:   { $ref: '#/components/schemas/Leave' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch(
  "/:id/approve",
  authenticate,
  authorize("hr", "admin"),
  approveLeave
);

/**
 * @openapi
 * /api/leaves/{id}/reject:
 *   patch:
 *     tags: [Leaves]
 *     summary: Reject a pending leave request (hr/admin)
 *     description: |
 *       Unlike approve, a `reviewNote` is mandatory — employees need an
 *       explanation when their request is denied.
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
 *             required: [reviewNote]
 *             properties:
 *               reviewNote: { type: string, description: "Reason shown to the employee." }
 *     responses:
 *       200:
 *         description: Leave rejected.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 leave:   { $ref: '#/components/schemas/Leave' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch(
  "/:id/reject",
  authenticate,
  authorize("hr", "admin"),
  rejectLeave
);

/**
 * @openapi
 * /api/leaves/{id}:
 *   delete:
 *     tags: [Leaves]
 *     summary: Withdraw a leave request
 *     description: |
 *       Only the request author can delete, and only while status is `pending`.
 *       Approved or rejected requests must stay in the audit log.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Leave deleted.
 *       400:
 *         description: Request is no longer pending.
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete("/:id", authenticate, deleteLeave);

export default router;
