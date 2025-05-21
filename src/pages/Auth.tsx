
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";

const Auth = () => {
  const { signIn, signUp, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Registration form state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Redirect authenticated users
  const from = (location.state as any)?.from || '/dashboard';
  if (isAuthenticated && !isLoading) {
    navigate(from, { replace: true });
  }
  
  const validateLoginForm = () => {
    const validationErrors: Record<string, string> = {};
    
    // Email validation
    if (!email) {
      validationErrors.email = 'Email is required';
    } else if (!z.string().email().safeParse(email).success) {
      validationErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      validationErrors.password = 'Password is required';
    }
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  
  const validateSignupForm = () => {
    const validationErrors: Record<string, string> = {};
    
    // Full name validation
    if (!fullName) {
      validationErrors.fullName = 'Full name is required';
    }
    
    // Email validation
    if (!registerEmail) {
      validationErrors.registerEmail = 'Email is required';
    } else if (!z.string().email().safeParse(registerEmail).success) {
      validationErrors.registerEmail = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!registerPassword) {
      validationErrors.registerPassword = 'Password is required';
    } else if (registerPassword.length < 6) {
      validationErrors.registerPassword = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (registerPassword !== confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateLoginForm()) {
      await signIn(email, password);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSignupForm()) {
      await signUp(registerEmail, registerPassword, fullName);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/">
            <h1 className="font-bold text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">ShopZap.io</h1>
          </Link>
          <p className="text-muted-foreground">Your WhatsApp store solution</p>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login" 
                ? "Enter your credentials to sign in to your account" 
                : "Create an account to get started with ShopZap"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={(v) => setActiveTab(v as "login" | "signup")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      className={errors.password ? "border-destructive" : ""}
                    />
                    {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <><span className="mr-2">Signing in</span><div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div></>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      placeholder="John Doe" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                      className={errors.fullName ? "border-destructive" : ""}
                    />
                    {errors.fullName && <p className="text-destructive text-xs">{errors.fullName}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <Input 
                      id="registerEmail" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={registerEmail} 
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className={errors.registerEmail ? "border-destructive" : ""}
                    />
                    {errors.registerEmail && <p className="text-destructive text-xs">{errors.registerEmail}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Password</Label>
                    <Input 
                      id="registerPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      value={registerPassword} 
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className={errors.registerPassword ? "border-destructive" : ""}
                    />
                    {errors.registerPassword && <p className="text-destructive text-xs">{errors.registerPassword}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={errors.confirmPassword ? "border-destructive" : ""}
                    />
                    {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword}</p>}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <><span className="mr-2">Creating account</span><div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div></>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center text-sm text-muted-foreground mt-2">
              By continuing, you agree to ShopZap's
              <Link to="/terms" className="text-primary hover:underline mx-1">Terms of Service</Link>
              and
              <Link to="/privacy" className="text-primary hover:underline mx-1">Privacy Policy</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
