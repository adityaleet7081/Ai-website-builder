import express from "express";
import type { Request, Response } from "express";
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";


const app = express();

const port = 3000;

// ✅ FIXED: Added localhost:5173 (Vite default) and proper CORS setup
const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}

app.use(cors(corsOptions))

// ✅ FIXED: Move express.json() BEFORE routes so body parsing works
app.use(express.json({limit:"50mb"}))

// ✅ FIXED: Use app.use() for better-auth handler to handle all /api/auth/* routes
app.use('/api/auth', toNodeHandler(auth))

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.use('/api/user', userRouter)
app.use('/api/project', projectRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});