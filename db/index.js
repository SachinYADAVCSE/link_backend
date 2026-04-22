import mongoose from "mongoose";

// connecting the database
const connectDb = async () => {
  try {
    // await mongoose.connect("mongodb://localhost:27017/liinks_builder");
    await mongoose.connect("mongodb+srv://sachinyadav53730:Shweta@cluster0.y33rt34.mongodb.net/liinks_builder");
    console.log("Database is Connected Successfully");
  } catch (err) {
    console.error("Database Connection Failed:", err);
    process.exit(1);
  }
}

export default connectDb;
// Defining the Schemas


const socialSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  { _id: false } // ⭐ important (no separate id for each social)
);


const userSchema = new mongoose.Schema({
  name: { type: String, index: true, required: true },
  username: { type: String, unique: true, index: true, required: true, lowercase: true, trim: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  profile: {
    name: String,
    bio: String,
    avatarUrl: String
  },
  settings: {
    publicPageSlug: { type: String, unique: true, index: true },
    isPublic: { type: Boolean, default: true },
    isOnboarded: { type: Boolean, default: false } // ⭐ add this
  }
}, { timestamps: true });

export const UserModel = new mongoose.model('user', userSchema);

const blockSchema = new mongoose.Schema({
  id: { type: String, required: true },           // client ID for dnd-kit
  type: { type: String, enum: ["link", "heading", "media", "folder", "text", "mediaLink"], required: true },
  content: { type: mongoose.Schema.Types.Mixed, default: {} },
  styles: { type: mongoose.Schema.Types.Mixed, default: {} },
  children: { type: [this], default: [] },        // allows nested folders
  order: { type: Number, default: 0 }
}, { _id: false });

const linkPageSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "user", index: true, required: true },
  url: { type: String, unique: true, required: true },
  socials: { type: [socialSchema], default: [] },  // ⭐ ADD THIS
  blocks: { type: [blockSchema], default: [] },
  theme: {
    backgroundType: String,
    backgroundColor: String,
    backgroundImage: String,
    textColor: String,
    fontFamily: String
  },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: "Template", required: true },
  isPublished: { type: Boolean, default: false },
  lastEdited: { type: Date, default: Date.now }
}, { timestamps: true });

export const LinkPageModel = new mongoose.model("LinkPage", linkPageSchema);

const AdminSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  age: { type: String },
  password: { type: String },
  contact: { type: String },
  address: { type: String },
  profile: { type: String },
  userType: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export const AdminModel = new mongoose.model('admin', AdminSchema);

// list of already Created Templates --> with Blocks
const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  previewImage: { type: String },
  blocks: [
    {
      type: { type: String, required: true },
      content: { type: mongoose.Schema.Types.Mixed, default: {} },
      styles: { type: mongoose.Schema.Types.Mixed, default: {} }
    }
  ],
  theme: {
    backgroundType: String,
    backgroundColor: String,
    backgroundImage: String,
    textColor: String,
    fontFamily: String
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const TemplateModel = new mongoose.model("Template", templateSchema);

const pageViewSchema = new mongoose.Schema({
  pageId: { type: mongoose.Types.ObjectId, ref: "LinkPage", index: true },
  ip: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now }
});

export const PageViewModel = mongoose.model("PageView", pageViewSchema);

const linkClickSchema = new mongoose.Schema({
  linkId: String, // from block.id
  pageId: { type: mongoose.Types.ObjectId, ref: "LinkPage", index: true },
  ip: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now }
});

export const LinkClickModel = mongoose.model("LinkClick", linkClickSchema);


// We want database Archi for 