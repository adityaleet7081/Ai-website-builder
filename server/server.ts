import express from "express";
import type { Request, Response } from "express";
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import { stripeWebhook } from "./controllers/stripeWebhook.js";


const app = express();

const port = process.env.PORT ||3000;

// ✅ FIXED: Added localhost:5173 (Vite default) and proper CORS setup
const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}

app.use(cors(corsOptions))

// ✅ Stripe webhook MUST come BEFORE express.json() (needs raw body)
app.post('/api/stripe', express.raw({type: 'application/json'}), stripeWebhook)

// ✅ FIXED: Move express.json() BEFORE routes so body parsing works
app.use(express.json({limit:"50mb"}))

// ✅ NEW: Add CSP headers to allow Stripe resources and fix console errors
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' data: https://fonts.gstatic.com https://js.stripe.com; " +
        "img-src 'self' data: https: blob:; " +
        "connect-src 'self' https://api.stripe.com https://js.stripe.com; " +
        "frame-src 'self' https://js.stripe.com https://hooks.stripe.com;"
    );
    next();
});

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