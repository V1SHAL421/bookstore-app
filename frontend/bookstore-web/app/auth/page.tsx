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
import { postJSON, setAccessToken } from "@/app/utils";

export default function AuthPage() {
    const router = useRouter();
    const [globalError, setGlobalError] = useState<string | null>(null);

    type TokenResponse = {
        access_token: string;
        refresh_token: string;
        token_type: "bearer";
        user: {
            id: string;
            email: string;
            full_name: string;
        };
    };
    type SignupInput = z.infer<typeof signupSchema>;
    type LoginInput = z.infer<typeof loginSchema>;

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

    const onSignupSubmit = async (data: SignupInput) => {
        setGlobalError(null);
        try {
            await postJSON("/users/signup", data);

            setGlobalError("Account created successfully!");
        } catch (err) {
            console.error("Signup error:", err);
            setGlobalError("Something went wrong. Please try again.");
        }
    };

    const onLoginSubmit = async (data: LoginInput) => {
        setGlobalError(null);
        try {
            const tokenResponse = await postJSON<TokenResponse, LoginInput>("/users/login", data);
            setAccessToken(tokenResponse.access_token);
            router.push("/dashboard");
        } catch (err) {
            console.error("Login error:", err);
            setGlobalError("Something went wrong. Please try again.");
        }
    };
    
    return (
        <div className="size-full flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Welcome to Bookdex</CardTitle>
                    <CardDescription>Login or create an account to continue</CardDescription>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
    );
}



// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { signupSchema, loginSchema } from "@/app/schema";
// import { z } from "zod";
// import { supabase } from "@/lib/supabase";
// import { applyFastApiFieldErrors, createUser, loginUser } from "./utils";

// type FastAPIValidationError = {
//   detail: Array<{
//     loc: (string | number)[];
//     msg: string;
//     type: string;
//   }>;
// };

// export class ApiError extends Error {
//   status: number;
//   payload: unknown;

//   constructor(status: number, payload: unknown, message = "API request failed") {
//     super(message);
//     this.status = status;
//     this.payload = payload;
//   }
// }

// export default function AuthPage() {
//   const router = useRouter();
//   const [globalError, setGlobalError] = useState<string | null>(null);

//   type SignupInput = z.infer<typeof signupSchema>;
//   type LoginInput = z.infer<typeof loginSchema>;

//   const signupForm = useForm<SignupInput>({
//     resolver: zodResolver(signupSchema),
//     defaultValues: {
//       first_name: "",
//       last_name: "",
//       email: "",
//       password: "",
//       confirm_password: "",
//     },
//   });

//   const loginForm = useForm<LoginInput>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const onSignupSubmit = async (data: SignupInput) => {
//     setGlobalError(null);
//     try {
//       await createUser(data);
//       return setGlobalError("Account created successfully! Please verify your email.");
//     } catch (e) {
//       if (e instanceof ApiError) {
//         console.error("API Error during signup:", e);
//         if (e.status === 422 && e.payload && typeof e.payload === "object") {
//           applyFastApiFieldErrors<SignupInput>(
//             e.payload as FastAPIValidationError,
//             signupForm.setError
//           );
//           return;
//         }
//         setGlobalError("Sign up failed. Please try again.");
//         return;
//       }
//       setGlobalError("Something went wrong. Please try again.");
//     }
//   };

//   const onLoginSubmit = async (data: LoginInput) => {
//     setGlobalError(null);
//     try {
//       const tokens = await loginUser(data);
//       const { error: sessionError } = await supabase.auth.setSession({
//         access_token: tokens.access_token,
//         refresh_token: tokens.refresh_token,
//       });
//       if (sessionError) {
//         setGlobalError("Login succeeded, but session setup failed. Please try again.");
//         return;
//       }
//       router.push("/dashboard");
//       return tokens;
//     } catch (e) {
//       if (e instanceof ApiError) {
//         if (e.status === 422 && e.payload && typeof e.payload === "object") {
//           applyFastApiFieldErrors<LoginInput>(e.payload as FastAPIValidationError, loginForm.setError);
//           return;
//         }
//         if (e.payload && typeof e.payload === "object" && "detail" in e.payload) {
//           const detail = (e.payload as { detail?: string }).detail;
//           if (detail) {
//             setGlobalError(detail);
//             return;
//           }
//         }
//         setGlobalError("Login failed. Check your credentials.");
//         return;
//       }
//       setGlobalError(`Something went wrong. Please try again. ${e instanceof Error ? e.message : ""}`);
//     }
//   };

//   return (
//     <div className="size-full flex items-center justify-center bg-background px-4">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle>Welcome to CoolEat</CardTitle>
//           <CardDescription>Login or create an account to continue</CardDescription>
//         </CardHeader>

//         <CardContent>
//           <Tabs defaultValue="login" className="w-full">
//             <TabsList className="grid w-full grid-cols-2">
//               <TabsTrigger value="login">Login</TabsTrigger>
//               <TabsTrigger value="signup">Sign Up</TabsTrigger>
//             </TabsList>

//             {globalError ? (
//               <p className="mt-4 text-sm text-destructive">{globalError}</p>
//             ) : null}

//             <TabsContent value="login">
//               <form className="mt-4 space-y-4" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
//                 <div className="space-y-2">
//                   <Label htmlFor="login-email">Email</Label>
//                   <Input id="login-email" type="email" {...loginForm.register("email")} />
//                   {loginForm.formState.errors.email ? (
//                     <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
//                   ) : null}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="login-password">Password</Label>
//                   <Input id="login-password" type="password" {...loginForm.register("password")} />
//                   {loginForm.formState.errors.password ? (
//                     <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
//                   ) : null}
//                 </div>

//                 <Button className="w-full" type="submit" disabled={loginForm.formState.isSubmitting}>
//                   {loginForm.formState.isSubmitting ? "Logging in..." : "Login"}
//                 </Button>
//               </form>
//             </TabsContent>

//             <TabsContent value="signup">
//               <form className="mt-4 space-y-4" onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="space-y-2">
//                     <Label htmlFor="first_name">First name</Label>
//                     <Input id="first_name" {...signupForm.register("first_name")} />
//                     {signupForm.formState.errors.first_name ? (
//                       <p className="text-sm text-destructive">{signupForm.formState.errors.first_name.message}</p>
//                     ) : null}
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="last_name">Last name</Label>
//                     <Input id="last_name" {...signupForm.register("last_name")} />
//                     {signupForm.formState.errors.last_name ? (
//                       <p className="text-sm text-destructive">{signupForm.formState.errors.last_name.message}</p>
//                     ) : null}
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="signup-email">Email</Label>
//                   <Input id="signup-email" type="email" {...signupForm.register("email")} />
//                   {signupForm.formState.errors.email ? (
//                     <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
//                   ) : null}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="signup-password">Password</Label>
//                   <Input id="signup-password" type="password" {...signupForm.register("password")} />
//                   {signupForm.formState.errors.password ? (
//                     <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
//                   ) : null}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="confirm_password">Confirm password</Label>
//                   <Input id="confirm_password" type="password" {...signupForm.register("confirm_password")} />
//                   {signupForm.formState.errors.confirm_password ? (
//                     <p className="text-sm text-destructive">
//                       {signupForm.formState.errors.confirm_password.message}
//                     </p>
//                   ) : null}
//                 </div>

//                 <Button className="w-full" type="submit" disabled={signupForm.formState.isSubmitting}>
//                   {signupForm.formState.isSubmitting ? "Creating account..." : "Sign Up"}
//                 </Button>
//               </form>
//             </TabsContent>
//           </Tabs>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
