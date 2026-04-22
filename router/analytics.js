import Router from "express";
import { PageViewModel, LinkClickModel } from "../db/index.js";
import auth from "../middleware/auth.js";
import mongoose from "mongoose";

const router = Router();

// Get analytics for a page
router.get("/:pageId", auth, async (req, res) => {

  try {
    
    const { pageId } = req.params;

    // Total Views
    const totalViews = await PageViewModel.countDocuments({ pageId });

    
    // Total Clicks
    const totalClicks = await LinkClickModel.countDocuments({ pageId });


    // Clicks per link
    const clicksPerLink = await LinkClickModel.aggregate([
      { $match: { pageId: new mongoose.Types.ObjectId(pageId) } },
      {
        $group: {
          _id: "$linkId",
          count: { $sum: 1 }
        }
      }
    ]);


    // Views per day (last 7 days)
    const viewsPerDay = await PageViewModel.aggregate([
      {
        $match: {
          pageId: new mongoose.Types.ObjectId(pageId),
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    console.log("Total Views are being Views Per Day.");

    return res.json({
      totalViews,
      totalClicks,
      clicksPerLink,
      viewsPerDay
    });

  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Analytics failed" });
  }
});

export default router;