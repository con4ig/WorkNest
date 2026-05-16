import Comment from "../models/Comment.js";
import Activity from "../models/Activity.js";
import Project from "../models/Project.js";

export const getCommentsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    let projectQuery = { _id: projectId };
    if (req.user.role !== "superadmin") {
      if (!req.user.company) {
        return res
          .status(403)
          .json({
            message: "No company assigned to the current user.",
          });
      }
      projectQuery.company = req.user.company._id;
    }
    const project = await Project.findOne(projectQuery);
    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found or access denied." });
    }

    const query = { project: projectId, parentComment: null };
    if (req.user.role !== "superadmin") {
      query.company = req.user.company;
    }

    const comments = await Comment.find(query)
      .populate("author", "username email profileImage")
      .populate("mentions", "username")
      .sort({ createdAt: -1 });

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate("author", "username email profileImage")
          .populate("mentions", "username")
          .sort({ createdAt: 1 });

        return {
          ...comment.toObject(),
          replies,
        };
      })
    );

    res.json(commentsWithReplies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { content, project, parentComment, mentions } = req.body;

    let projectQuery = { _id: project };
    if (req.user.role !== "superadmin") {
      if (!req.user.company) {
        return res
          .status(403)
          .json({
            message: "No company assigned to the current user.",
          });
      }
      projectQuery.company = req.user.company._id;
    }
    const projectDoc = await Project.findOne(projectQuery);
    if (!projectDoc) {
      return res
        .status(404)
        .json({ message: "Project not found or access denied." });
    }

    const comment = new Comment({
      content,
      project,
      author: req.user._id,
      parentComment: parentComment || null,
      mentions: mentions || [],
      company: projectDoc.company,
    });

    const savedComment = await comment.save();
    await savedComment.populate("author", "username email profileImage");
    await savedComment.populate("mentions", "username");

    await Activity.create({
      project,
      user: req.user._id,
      action: parentComment ? "comment_replied" : "comment_added",
      description: parentComment
        ? `replied to a comment`
        : `added a comment`,
      metadata: { commentId: savedComment._id },
      company: projectDoc.company,
    });

    res.status(201).json(savedComment);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(400).json({ message: err.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Company isolation
    if (
      req.user.role !== "superadmin" &&
      comment.company.toString() !== req.user.company.toString()
    ) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    comment.content = req.body.content;
    comment.edited = true;
    comment.editedAt = new Date();

    const updatedComment = await comment.save();
    await updatedComment.populate("author", "username email profileImage");
    await updatedComment.populate("mentions", "username");

    res.json(updatedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    let commentQuery = { _id: req.params.id };
    if (req.user.role !== "superadmin") {
      if (!req.user.company) {
        return res
          .status(403)
          .json({
            message: "No company assigned to the current user.",
          });
      }
      commentQuery.company = req.user.company._id;
    }
    const comment = await Comment.findOne(commentQuery);

    if (!comment) {
      return res
        .status(404)
        .json({ message: "Comment not found or access denied." });
    }

    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    await Comment.deleteMany({ parentComment: comment._id });

    await Activity.create({
      project: comment.project,
      user: req.user._id,
      action: "comment_deleted",
      description: `deleted a comment`,
      company: comment.company,
    });

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
