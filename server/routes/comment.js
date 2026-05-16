import express from "express";
import Authenticate from "../middleware/authenticate.js";
import {
  getCommentsByProject,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

/**
 * @openapi
 * /api/comments/project/{projectId}:
 *   get:
 *     tags: [Comments]
 *     summary: List top-level comments (with replies) for a project
 *     description: |
 *       Returns one level of threading: each top-level comment carries its
 *       direct `replies` array. Tenant-scoped via the parent project, so
 *       cross-tenant IDs return 404.
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Threaded comments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:           { type: string }
 *                   content:       { type: string }
 *                   project:       { type: string }
 *                   parentComment: { type: string, nullable: true }
 *                   author:        { $ref: '#/components/schemas/User' }
 *                   mentions:
 *                     type: array
 *                     items: { $ref: '#/components/schemas/User' }
 *                   edited:        { type: boolean }
 *                   editedAt:      { type: string, format: date-time, nullable: true }
 *                   createdAt:     { type: string, format: date-time }
 *                   replies:
 *                     type: array
 *                     items: { type: object }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/project/:projectId", Authenticate, getCommentsByProject);

/**
 * @openapi
 * /api/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Post a new comment or a threaded reply
 *     description: |
 *       Supply `parentComment` to nest under an existing comment; omit it for
 *       a top-level post. Emits a `comment_added` or `comment_replied`
 *       activity entry for the project's audit log.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, project]
 *             properties:
 *               content: { type: string }
 *               project:
 *                 type: string
 *                 description: ID of the parent project (must be in caller's tenant).
 *               parentComment:
 *                 type: string
 *                 nullable: true
 *                 description: Set this to nest a reply under another comment.
 *               mentions:
 *                 type: array
 *                 items: { type: string }
 *                 description: User IDs referenced via @-mentions in the body.
 *     responses:
 *       201:
 *         description: Comment created.
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.post("/", Authenticate, createComment);

/**
 * @openapi
 * /api/comments/{id}:
 *   patch:
 *     tags: [Comments]
 *     summary: Edit a comment's body
 *     description: |
 *       Only the original author can edit. Sets `edited: true` and stamps
 *       `editedAt` so the UI can render an "edited" badge.
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
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *     responses:
 *       200:
 *         description: Updated comment.
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch("/:id", Authenticate, updateComment);

/**
 * @openapi
 * /api/comments/{id}:
 *   delete:
 *     tags: [Comments]
 *     summary: Delete a comment (author or admin)
 *     description: |
 *       Cascades: deleting a top-level comment also removes its replies.
 *       Emits a `comment_deleted` activity entry.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Comment deleted.
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete("/:id", Authenticate, deleteComment);

export default router;
