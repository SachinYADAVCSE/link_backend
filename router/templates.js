import Router from "express";
import {TemplateModel} from "../db/index.js";
import auth from "../middleware/auth.js";

const router = Router();

// GET all templates
router.get("/", auth, async (req, res) => {
  const user = req.user;
  const templates = await TemplateModel.find();
  res.status(200).json({templates: templates, user: user});
});

router.get("/:name", async (req, res) => {
  const template = await TemplateModel.findOne({ name: req.params.name });

  if (!template) {
    return res.status(404).json({ error: "Template not found" });
  }

  res.json(template);
});

export default router;
