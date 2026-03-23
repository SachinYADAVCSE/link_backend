import Router from 'express'
import { LinkPageModel, UserModel, TemplateModel } from '../db/index.js'
import auth from '../middleware/auth.js'

const linkRoutes = Router();

// to get all the pages
// to be honest there will not going to be many pages
linkRoutes.get('/pages', auth, async (req, res) => {
  const userId = req.user.id;

  let pages = await LinkPageModel.find({ userId });

  // auto create first page
  if (pages.length === 0) {
    const defaultPage = await LinkPageModel.create({
      userId,
      title: "My Page",
      blocks: []
    });

    pages = [defaultPage];
  }

  res.json(pages);
});


// to save the changes in builder
// to test it we have to find Blocks from somewhere
linkRoutes.put('/:id', auth, async (req, res) => {

  const id = req.params.id
  const { blocks = [], title = "My Page", socials = [], theme = {} } = req.body;
  console.log(req.body, "there we go --> of Body");
  
  // now tring to update the page based on the details
  // It's finding 
  console.log("From save function", blocks);
  console.log("Socials: here we have socials ---> ", socials);

  const page = await LinkPageModel.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { $set: { blocks: blocks, title: title, socials: socials, theme: theme, lastEdited: new Date() } },
    { new: true }
  );
  console.log(page, "This is the Page we are returning");
  
  if (!page) return res.status(404).json({ code: 404, message: "Page not Found", data: "" })
  
  return res.json(page);

})

// doing the Publish work or not
linkRoutes.patch('/:id/publish', auth, async (req, res) => {

  const { isPublished } = req.body;
  const page = await LinkPageModel.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $set: { isPublished: !!isPublished } },
    { new: true }
  )
  if (!page) return res.status(404).json({ code: 404, message: "Page not Found" })
  return res.json(page);
})

// this is where, Id is used to fetch, results from the LinkPageModel
linkRoutes.get("/:id", auth, async (req, res) => {

  const page = await LinkPageModel.findOne({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!page) return res.status(404).json({ error: "Not found" });

  res.json(page);
});


linkRoutes.post("/createPage", auth, async (req, res) => {

  try {
    const userId = req.user.id; // coming from auth middleware

    const { name, bio, avatar, url, blocks, templateId } = req.body;

    // 1️⃣ Validate required fields
    if (!name || !url) {
      return res.status(400).json({
        message: "Name and URL are required",
      });
    }

    // 2️⃣ Fetch logged-in user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // 3️⃣ Check URL uniqueness
    const existingPage = await LinkPageModel.findOne({ url });
    if (existingPage) {
      return res.status(409).json({
        message: "This URL is already taken",
      });
    }

    // 4️⃣ Get template (default if not provided)
    let selectedTemplate;

    if (templateId) {
      selectedTemplate = await TemplateModel.findById(templateId);
    } else {
      selectedTemplate = await TemplateModel.findOne({ name: "Default" });
    }

    if (!selectedTemplate) {
      return res.status(404).json({
        message: "Template not found",
      });
    }

    // 5️⃣ Update user profile (from onboarding form)
    user.profile.name = name;
    user.profile.bio = bio || "";
    user.profile.avatarUrl = avatar || "";

    user.settings.isOnboarded = true;

    // Optional: auto-assign public slug
    if (!user.settings.publicPageSlug) {
      user.settings.publicPageSlug = url;
    }

    await user.save();

    // 6️⃣ Create Link Page
    const linkPage = await LinkPageModel.create({
      userId: user._id,
      url,
      blocks: blocks?.length ? blocks : selectedTemplate.defaultBlocks,
      templateId: selectedTemplate._id,
      isPublished: false,
    });

    // 7️⃣ Success response
    return res.status(201).json({
      message: "Page created successfully",
      pageId: linkPage._id, // page id fetch from frontend put it in params and run redirect to builder.
      builderUrl: `/builder/${linkPage._id}`,
    });

  } catch (err) {
    console.error("Create Page Error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});




export default linkRoutes;

