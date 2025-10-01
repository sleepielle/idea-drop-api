import express from "express";
import Idea from "../models/Idea.js";
import mongoose from "mongoose";
const router = express.Router();
import { protect } from "../middleware/auth.js";

// @route           GET /api/ideas
// @description     Get all ideas
// @access          Public
// @query           _limit (optional limit for ideas returned)
router.get("/", async (req, res, next) => {
  try {
    const limit = parseInt(req.query._limit);
    const query = Idea.find().sort({ createdAt: -1 }); //-1 means sort descending

    if (!isNaN(limit)) {
      query.limit(limit);
    }

    const ideas = await query.exec();
    res.json(ideas);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// @route           GET /api/ideas/:id
// @description     Get idea by id
// @access          Public
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  //Custom message if id is not found
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const idea = await Idea.findById(id);

  try {
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }
    res.json(idea);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// @route           POST /api/ideas
// @description     Create new idea
// @access          Public
router.post("/", protect, async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body || {};

    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error("Title, summary and description are all required values");
    }

    const newIdea = new Idea({
      title,
      summary,
      description,
      //if the tags are a string, split to turn to array and each tag will be trimmed and filtered for whitespaces. If it is not a string, but it is an array, then keep it or create an empty array
      tags:
        typeof tags === "string"
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : Array.isArray(tags)
          ? tags
          : [],
      user: req.user._id,
    });

    //201: success. created something.
    const savedIdea = await newIdea.save();
    return res.status(201).json(savedIdea);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// @route           DELETE /api/ideas/:id
// @description     Delete idea by id
// @access          Public
router.delete("/:id", protect, async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const idea = await Idea.findById(id);

    if (!idea) {
      res.status(404);
      throw new Error("Idea Not Found");
    }
    //Check if user is the owner of the idea
    if (idea.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("User not authorized to delete this idea");
    }

    await idea.deleteOne();
    res.json({ message: "Idea deleted successfully" });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// @route           PUT /api/ideas/:id
// @description     Update idea by id
// @access          Public

router.put("/:id", protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const idea = await Idea.findById(id);
    if (!idea) {
      res.status(404);
      throw new Error("Idea not found");
    }
    //Check if user is the owner of the idea
    if (idea.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("User not authorized to update this idea");
    }

    const { title, summary, description, tags } = req.body || {};

    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error("Title, summary and description are all required values");
    }

    idea.title = title;
    idea.summary = summary;
    idea.description = description;
    idea.tags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    idea.name = req.user.name;

    const updatedIdea = await idea.save();
    res.json(updatedIdea);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export default router;
