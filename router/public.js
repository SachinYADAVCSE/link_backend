import Router from 'express';
import { UserModel, LinkPageModel, PageViewModel } from '../db/index.js';
import { LinkClickModel } from "../db/index.js";

const publicRoutes = Router();


// this is the route which has been added.
publicRoutes.post("/click", async (req, res) => {
  try {
    // fetching the pageId and LinkId from body
    const { pageId, linkId } = req.body;

    if (!pageId || !linkId) {
      return res.status(400).json({ message: "Missing data" });
    }

    // then creating Link Click Model -- taking pageId & link id, Ip and userAgent.
    await LinkClickModel.create({
      pageId,
      linkId,
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    // returning the success as true.
    res.json({ success: true });

  } catch (err) {
    
    console.error("Click tracking error:", err);
    res.status(500).json({ message: "Error tracking click" });
  }
});


// Public slug Apix
publicRoutes.get("/:slug", async (req, res) => {
    const slug = req.params.slug; // this is a page things -- UrL Not a Slug.

    console.log("Slug --- from slug function");

    // Getting the userModel
    // usPublic: true try
    console.log(slug);
  
    // url 
    // Based on it getting the LinkPage
    const page = await LinkPageModel.findOne(
        { url: slug, isPublished: true }
    ).lean()

    console.log(page, "This is the Page that is coming from frontend")
    // Return the Page
    if (!page) return res.status(404).json({ code: 404, message: "Page Not Found" });


    // Track Page View (ADD THIS)
    try {
        await PageViewModel.create({
          pageId: page._id,
          ip: req.ip,
          userAgent: req.headers["user-agent"]  
        });
    } catch (err) {
        console.error("Analytics error (view): ", err);
    }


    // user 
    const user = await UserModel.findOne({ "_id": page.userId }) // it's finding the user based on the PublicPageSlug.

    console.log(user);

    if (!user) {
        console.log(" How we were at that time? ");
        return res.status(404).json({ code: 404, message: "Invalid Url Address" });
    }

    // Returning the Possible useful items  
    // Add the Description or Caption
    return res.json({
        pageId: page._id,
        username: user.username,
        profile: user.profile,
        title: page.title,
        blocks: page.blocks,
        theme: page.theme,
        socials: page.socials
    });
})

export default publicRoutes;