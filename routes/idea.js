import express from "express";
const router = express.Router();
import Idea from "../models/Idea.js";
import mongoose from "mongoose";

// @route           GET /api/ideas
// @description     Get all ideas
// @access          Public
/**
 * @swagger
 * /api/ideas:
 *   get:
 *     summary: Get all ideas
 *     description: Retrieve a list of all ideas
 *     responses:
 *       200:
 *         description: Success
 */

router.get("/", async (req, res, next) => {
  try {
    const ideas = await Idea.find();
    res.json(ideas);
  } catch (error) {
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

  //
  try {
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }
    res.json(idea);
  } catch (error) {
    next(error);
  }
});

// @route           POST /api/ideas
// @description     POST all ideas
// @access          Public
router.post("/", async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body;

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
          ? tags.split(".").map((tag) => tag.trim().filter(Boolean))
          : Array.isArray(tags)
          ? tags
          : [],
    });

    //201: success. created something.
    const savedIdea = await newIdea.save();
    return res.status(201).json(savedIdea);
  } catch (error) {
    next(error);
  }
});

export default router;
