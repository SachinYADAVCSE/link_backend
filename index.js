// import "dotenv/config.js";
import express from "express";
// import { connectDB } from "./db.js";\
import {} from 'dotenv/config';
import analyticsRoute from "./router/analytics.js";
import  router from "./router/userRouter.js";
import linkRoutes  from "./router/links.js";
import  publicRoutes  from "./router/public.js";
import templateRoute from "./router/templates.js";
import OnboardingRoutes from "./router/onboarding.js";
import userRoute from './router/userRouter.js';
import  connectDb  from "./db/index.js";
import cors from 'cors';
await connectDb();

const app = express();
// app.use(cors());

app.use(express.json());

app.use(cors())

console.log("We are reaching here");

app.get("/",(req, res)=>{
    console.log("everthing is fine");
    return res.json({ msg:"everything......"});
})

// this is for purely server visits
app.use("/api/auth", router);
app.use("/api/links", linkRoutes);
app.use("/api/analytics", analyticsRoute);
app.use("/api/public", publicRoutes);
app.use("/api/onboarding/complete", OnboardingRoutes);
app.use("/api/templates", templateRoute);
app.use("/api/users", userRoute);

const PORT = 4000;
// http://localhost:4000/api/auth/register
// http://localhost:4000/api/auth/login


app.listen(PORT);

