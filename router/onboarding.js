import Router from "express";
import { TemplateModel, LinkPageModel, UserModel } from "../db/index.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/complete", auth, async (req, res) => {
    const { templateId, profile, headerText, socials } = req.body;

    const template = await TemplateModel.findById(templateId);

    if (!template) return res.status(404).json({ error: "Template not found" });

    // clone blocks
    let blocks = JSON.parse(JSON.stringify(template.blocks));

    // inject user data into template
    blocks = blocks.map(block => {
        if (block.type === "heading")
            block.content.text = headerText;

        if (block.type === "profile")
            block.content = profile;

        if (block.type === "socials")
            block.content.links = socials;

        return block;
    });

    // create page
    const page = await LinkPageModel.create({
        userId: req.user.id,
        title: "My Page",
        blocks,
        isPublished: false
    });

    // mark onboarded
    await UserModel.findByIdAndUpdate(req.user.id, {
        "settings.isOnboarded": true
    });

    res.json({ pageId: page._id });
});

export default router;
