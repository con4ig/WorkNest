import express from "express";
import Comment from "../models/Comment.js";
import Activity from "../models/Activity.js";
import Authenticate  from "../middleware/authenticate.js";

const router = express.Router();

// GET - Pobierz wszystkie komentarze dla projektu
router.get("/project/:projectId", Authenticate, async (req, res) => {
  try {
    const comments = await Comment.find({ 
      project: req.params.projectId,
      parentComment: null // Tylko główne komentarze
    })
      .populate("author", "username email profileImage")
      .populate("mentions", "username")
      .sort({ createdAt: -1 });

    // Dla każdego komentarza pobierz odpowiedzi
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
});

// POST - Dodaj nowy komentarz
router.post("/", Authenticate, async (req, res) => {
  try {
    const { content, project, parentComment, mentions } = req.body;

    const comment = new Comment({
      content,
      project,
      author: req.user._id,
      parentComment: parentComment || null,
      mentions: mentions || [],
    });

    const savedComment = await comment.save();
    await savedComment.populate("author", "username email profileImage");
    await savedComment.populate("mentions", "username");

    // Dodaj aktywność
    await Activity.create({
      project,
      user: req.user._id,
      action: "comment_added",
      description: parentComment 
        ? `odpowiedział(a) na komentarz`
        : `dodał(a) komentarz`,
      metadata: { commentId: savedComment._id },
    });

    res.status(201).json(savedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH - Edytuj komentarz
router.patch("/:id", Authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: "Komentarz nie znaleziony" });
    }

    // Sprawdź czy użytkownik jest autorem komentarza
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Brak uprawnień" });
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
});

// DELETE - Usuń komentarz
router.delete("/:id", Authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: "Komentarz nie znaleziony" });
    }

    // Sprawdź czy użytkownik jest autorem lub adminem
    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Brak uprawnień" });
    }

    // Usuń też wszystkie odpowiedzi do tego komentarza
    await Comment.deleteMany({ parentComment: comment._id });

    // Dodaj aktywność
    await Activity.create({
      project: comment.project,
      user: req.user._id,
      action: "comment_deleted",
      description: `usunął(a) komentarz`,
    });

    await comment.deleteOne();
    res.json({ message: "Komentarz usunięty" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;