import { z } from "zod";

export const signupSchema = z.object({
    full_name: z.string().min(1, "Full name is required"),
    email: z.email().min(1, "Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirm_password: z.string().min(6, "Confirm Password must be at least 6 characters long"),
})

export const loginSchema = z.object({
    email: z.string().min(1, "Email is required"),
    password: z.string().min(1, "Password is required"),
})