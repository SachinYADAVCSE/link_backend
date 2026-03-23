import Router from 'express';
import { UserModel, LinkPageModel } from '../db/index.js';

const publicRoutes = Router();

// Public slug Api
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

    // Return the Page
    if (!page) return res.status(404).json({ code: 404, message: "Page Not Found" });

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
        username: user.username,
        profile: user.profile,
        title: page.title,
        blocks: page.blocks
    });
})

export default publicRoutes;