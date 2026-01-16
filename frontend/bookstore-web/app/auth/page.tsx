"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginSchema, signupSchema } from "@/app/schema";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postJSON, setAccessToken, setUser, ApiError } from "@/app/utils";
import { AnimatedText } from "@/components/ui/animated-text";

export default function AuthPage() {
    const router = useRouter();
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

    type TokenResponse = {
        access_token: string;
        refresh_token: string;
        token_type: "bearer";
        user: {
            id: string;
            email: string;
            full_name: string;
            role: string;
        };
    };
    type SignupInput = z.infer<typeof signupSchema>;
    type LoginInput = z.infer<typeof loginSchema>;

    type FastAPIValidationError = {
        detail: Array<{
            loc: (string | number)[];
            msg: string;
            type: string;
        }>;
    };

    const signupForm = useForm<SignupInput>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            full_name: "",
            email: "",
            password: "",
            confirm_password: "",
        },
    });

    const loginForm = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const applyFastApiFieldErrors = <T extends Record<string, unknown>>(
        error: FastAPIValidationError,
        setError: (name: keyof T, error: { message: string }) => void
    ) => {
        for (const fieldError of error.detail) {
            const field = fieldError.loc[1] as keyof T;
            if (field) {
                setError(field, { message: fieldError.msg });
            }
        }
    };

    const onSignupSubmit = async (data: SignupInput) => {
        setGlobalError(null);
        try {
            await postJSON("/users/signup", data);
            setActiveTab("login");
            setGlobalError("Account created successfully! Please login.");
        } catch (err) {
            if (err instanceof ApiError) {
                console.error("Signup API error:", err);
                if (err.status === 422 && err.payload && typeof err.payload === "object") {
                    applyFastApiFieldErrors<SignupInput>(err.payload as FastAPIValidationError, signupForm.setError);
                    return;
                }
                if (err.payload && typeof err.payload === "object" && "detail" in err.payload) {
                    const detail = (err.payload as { detail?: string }).detail;
                    if (detail) {
                        setGlobalError(detail);
                        return;
                    }
                }
                setGlobalError("Signup failed. Please try again.");
                return;
            }
            console.error("Signup error:", err);
            setGlobalError("Something went wrong. Please try again.");
        }
    };

    const onLoginSubmit = async (data: LoginInput) => {
        setGlobalError(null);
        try {
            const tokenResponse = await postJSON<TokenResponse, LoginInput>("/users/login", data);
            setAccessToken(tokenResponse.access_token);
            setUser(tokenResponse.user);
            if (tokenResponse.user.role === 'admin') {
                router.push("/admin");
            } else {
                router.push("/home");
            }
        } catch (err) {
            if (err instanceof ApiError) {
                console.error("Login API error:", err);
                if (err.status === 422 && err.payload && typeof err.payload === "object") {
                    applyFastApiFieldErrors<LoginInput>(err.payload as FastAPIValidationError, loginForm.setError);
                    return;
                }
                if (err.payload && typeof err.payload === "object" && "detail" in err.payload) {
                    const detail = (err.payload as { detail?: string }).detail;
                    if (detail) {
                        setGlobalError(detail);
                        return;
                    }
                }
                setGlobalError("Login failed. Check your credentials.");
                return;
            }
            console.error("Login error:", err);
            setGlobalError("Something went wrong. Please try again.");
        }
    };
    
    return (
        <div className="size-full flex flex-col items-center justify-start bg-gray-50 px-4 py-10">
            <div className="text-center mb-6">
                <AnimatedText text="Bookdex" />
            </div>
            <div className="relative w-full max-w-md">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-gray-200" />
                <Card className="relative">
                    <CardHeader>
                        <CardTitle>Access Your Account</CardTitle>
                        <CardDescription>Create an account to order books and track your purchases.</CardDescription>
                    </CardHeader>

                    <CardContent>
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors">Login</TabsTrigger>
                            <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors">Sign Up</TabsTrigger>
                        </TabsList>

                        {globalError ? (
                            <p className="mt-4 text-sm text-destructive">{globalError}</p>
                        ) : null}

                        <TabsContent value="login">
                            <form className="mt-4 space-y-4" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input id="login-email" type="email" {...loginForm.register("email")} />
                                    {loginForm.formState.errors.email ? (
                                        <p className="text-sm text-destructive">
                                            {loginForm.formState.errors.email.message}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <Input id="login-password" type="password" {...loginForm.register("password")} />
                                    {loginForm.formState.errors.password ? (
                                        <p className="text-sm text-destructive">
                                            {loginForm.formState.errors.password.message}
                                        </p>
                                    ) : null}
                                </div>

                                <Button className="w-full" type="submit" disabled={loginForm.formState.isSubmitting}>
                                    {loginForm.formState.isSubmitting ? "Logging in..." : "Login"}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form className="mt-4 space-y-4" onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full name</Label>
                                    <Input id="full_name" {...signupForm.register("full_name")} />
                                    {signupForm.formState.errors.full_name ? (
                                        <p className="text-sm text-destructive">
                                            {signupForm.formState.errors.full_name.message}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input id="signup-email" type="email" {...signupForm.register("email")} />
                                    {signupForm.formState.errors.email ? (
                                        <p className="text-sm text-destructive">
                                            {signupForm.formState.errors.email.message}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <Input id="signup-password" type="password" {...signupForm.register("password")} />
                                    {signupForm.formState.errors.password ? (
                                        <p className="text-sm text-destructive">
                                            {signupForm.formState.errors.password.message}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm_password">Confirm password</Label>
                                    <Input
                                        id="confirm_password"
                                        type="password"
                                        {...signupForm.register("confirm_password")}
                                    />
                                    {signupForm.formState.errors.confirm_password ? (
                                        <p className="text-sm text-destructive">
                                            {signupForm.formState.errors.confirm_password.message}
                                        </p>
                                    ) : null}
                                </div>

                                <Button className="w-full" type="submit" disabled={signupForm.formState.isSubmitting}>
                                    {signupForm.formState.isSubmitting ? "Creating account..." : "Sign Up"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
