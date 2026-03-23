import { UserModel, LinkPageModel } from "../db/index.js";
import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import multer from 'multer';
import auth from "../middleware/auth.js";
const upload = multer({ dest: 'uploads/' });

const JWT_SECRET = "badmanSuper_890"
const router = Router();

console.log("inside router file");

router.post('/register', upload.single('profile.avatarUrl'), async (req, res) => {
    console.log("it workings, ###########");

    try {
        const { name, username, email, password } = req.body;
        const profileFile = req.file;

        if (!name || !username || !email || !password)
            return res.status(400).json({ msg: "Please fill all the Fields" });

        // Check if user doesn't already exists
        // $or this is a query operator of mongodb which is used to do or thing, like email or username if exist one of them
        const exist = await UserModel.findOne({ $or: [{ username }, { email }] });

        if (exist) return res.status(409).json({ error: "User already Exists" });

        // hashing the password
        const passwordHash = await bcrypt.hash(password, 10);

        //  inserting the data into the database

        const user = await UserModel.create({
            name: name,
            username: username,
            email: email,
            passwordHash: passwordHash,
            profile: {
                avatarUrl: profileFile ? profileFile.path : null,
            },
            settings: { publicPageSlug: username, isOnboarded: false}
        });

        const token = jwt.sign({ id: user._id, username: username }, JWT_SECRET)

        return res.status(200).json({
            user: user,
            token: token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const exist = await UserModel.findOne({ email });
    if (!exist)
        return res.status(409).json({
            code: 409,
            message: "Email doesn't exist",
        });

    const ok = await bcrypt.compare(password.toString(), exist.passwordHash);
    if (!ok)
        return res.status(400).json({
            code: 400,
            message: "Invalid credentials",
        });

    // check page
    const page = await LinkPageModel.findOne({ userId: exist._id });

    const token = jwt.sign(
        { id: exist._id, username: exist.username },
        JWT_SECRET
    );

    console.log(" This is the Onboarding true or false: ", !!page);
    
    return res.status(200).json({
        code: 200,
        message: "Login Successfully",
        token,
        pageId: page?._id || null,   // safe
        isOnboarded: !!page          // ⭐ THIS IS THE KEY
    });
});

// 
router.get("/me", auth, async (req, res) => {
    try {
  
      const user = await UserModel
        .findById(req.user.id)
        .select("-passwordHash");
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({
        success: true,
        data: user
      });
  
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });


  router.put("/me", auth, async (req, res) => {
    try {
  
      const { name, username, email, bio, avatarUrl } = req.body;
  
      const updated = await UserModel.findByIdAndUpdate(
        req.user.id,
        {
          $set: {
            name,
            username,
            email,
            "profile.bio": bio,
            "profile.avatarUrl": avatarUrl
          }
        },
        { new: true }
      ).select("-passwordHash");
  
      res.json({
        success: true,
        data: updated
      });
  
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });


  router.put("/password", auth, async (req, res) => {
    try {
  
      const { currentPassword, newPassword } = req.body;
  
      const user = await UserModel.findById(req.user.id);
  
      const valid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );
  
      if (!valid) {
        return res.status(400).json({
          message: "Current password incorrect"
        });
      }
  
      const newHash = await bcrypt.hash(newPassword, 10);
  
      user.passwordHash = newHash;
      await user.save();
  
      res.json({
        success: true,
        message: "Password updated"
      });
  
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });



// this route is for fetching the profile details.
router.put('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, bio, avatar } = req.body;

        const user = await UserModel.findByIdAndUpdate(
            userId,
            {
                profile: {
                    name,
                    bio,
                    avatarUrl: avatar
                }    
            },    
            { new: true }
        );    

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });    
        }    

        res.json({
            success: true,
            data: user
        });    

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });    
    }    
});    


router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        console.log("Are you hitting me");

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(403).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});



export default router;