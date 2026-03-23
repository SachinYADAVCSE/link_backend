import mongoose from "mongoose";
import { TemplateModel } from "./index.js";

const MONGO_URI = "mongodb://localhost:27017/liinks_builder";

const seedTemplates = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected ✅");

    // Optional: clear old templates
    await TemplateModel.deleteMany();

    await TemplateModel.insertMany([
      // 🔹 1. Minimal Template
      {
        name: "Minimal",
        previewImage: "",
        theme: {
          backgroundType: "color",
          backgroundColor: "#ffffff",
          textColor: "#000000",
          fontFamily: "Inter"
        },
        blocks: [
          {
            type: "heading",
            content: { text: "Welcome to my page" },
            styles: {}
          },
          {
            type: "link",
            content: { title: "My Website", url: "" },
            styles: {}
          }
        ]
      },

      // 🔹 2. YouTube Creator Template
      {
        name: "YouTube Creator",
        previewImage: "",
        theme: {
          backgroundType: "color",
          backgroundColor: "#0f0f0f",
          textColor: "#ffffff",
          fontFamily: "Inter"
        },
        blocks: [
          {
            type: "mediaLink",
            content: {
              title: "Watch My Latest Video",
              src: "",
              url: ""
            },
            styles: {
              borderRadius: 16,
              backgroundColor: '#ffffff'   // from blockOverrides
            }
          },
          {
            type: "link",
            content: {
              title: "Instagram",
              url: ""
            },
            styles: {}
          }
        ]
      },

      // 🔹 3. Website Creator Template
      {
        name: "Website Owner",
        previewImage: "",
        theme: {
          backgroundType: "color",
          backgroundColor: "#7AAACE",
          textColor: "#111111",
          fontFamily: "Inter"
        },
        blocks: [
          {
            type: "heading",
            content: {
              text: "Welcome to My Site"
            },
            styles: {
              borderRadius: 10,
              borderWidth: "2px 2px 2px 2px",
              borderStyle: "solid",
              borderColor: "#355872",
              textColor: "#355872",
              backgroundColor: '#ffffff'
            }
          },
          {
            type: "link",
            content: {
              title: "Visit My Website",
              url: ""
            },
            styles: {
              textColor: "#355872",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
              borderRadius: 10,
              borderWidth: "2px 2px 2px 2px",
              borderStyle: "solid",
              borderColor: "#355872",
              textColor: "#355872",
              backgroundColor: "#ffffff",
              boxShadow: ''
            }
          }
        ]
      }
    ]);

    console.log("Templates Seeded Successfully 🚀");
    process.exit();

  } catch (error) {
    console.error("Seeding Failed ❌", error);
    process.exit(1);
  }
};

seedTemplates();