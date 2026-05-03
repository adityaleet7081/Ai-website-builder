import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js";

const envOrigins = process.env.TRUSTED_ORIGINS?.split(',') || [];
const defaultOrigins = [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://ai-website-builder-ui.onrender.com',
    'https://ai-website-builder-frontend-78nf.onrender.com'
];
const trustedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
      emailAndPassword: { 
    enabled: true, 
  },
  user: {
    deleteUser: {enabled  : true}
  },
  trustedOrigins,
  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  advanced: {
    cookies : {
        session_token : {
            name: 'auth_session',
            attributes : {
                httpOnly : true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production'?'none':'lax',
                path: '/',
            }
        }
    }
  }
});