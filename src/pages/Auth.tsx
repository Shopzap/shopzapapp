
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from 'sonner';
import { z } from "zod";
import PasswordInput from '@/components/ui/password-input';

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
  
  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!z.string().email().safeParse(email).success) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string, isSignup = false) => {
    if (!password) return 'Password is required';
    if (isSignup && password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validatePasswordStrength = (password: string) => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!hasLower || !hasUpper || !hasNumber || !hasSymbol || !isLongEnough) {
      return 'Password should contain uppercase, lowercase, number, and symbol';
    }
    return '';
  };
  
  const validateLoginForm = () => {
    const validationErrors: Record<string, string> = {};
    
    const emailError = validateEmail(email);
    if (emailError) validationErrors.email = emailError;
    
    const passwordError = validatePassword(password);
    if (passwordError) validationErrors.password = passwordError;
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  
  const validateSignupForm = () => {
    const validationErrors: Record<string, string> = {};
    
    if (!fullName.trim()) {
      validationErrors.fullName = 'Full name is required';
    }
    
    const emailError = validateEmail(registerEmail);
    if (emailError) validationErrors.registerEmail = emailError;
    
    const passwordError = validatePassword(registerPassword, true);
    if (passwordError) {
      validationErrors.registerPassword = passwordError;
    } else {
      const strengthError = validatePasswordStrength(registerPassword);
      if (strengthError) validationErrors.registerPassword = strengthError;
    }
    
    if (registerPassword !== confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateLoginForm()) {
      try {
        await signIn(email, password);
      } catch (error: any) {
        toast.error(error.message || 'Login failed');
      }
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSignupForm()) {
      try {
        await signUp(registerEmail, registerPassword, fullName);
      } catch (error: any) {
        toast.error(error.message || 'Signup failed');
      }
    }
  };

  const handlePasswordGenerated = (password: string) => {
    toast.success('Strong password generated!');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/">
            <h1 className="font-bold text-2xl sm:text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              ShopZap.io
            </h1>
          </Link>
          <p className="text-muted-foreground text-sm sm:text-base">Your WhatsApp store solution</p>
        </div>
        
        <Card className="w-full">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl sm:text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center text-sm">
              {activeTab === "login" 
                ? "Enter your credentials to sign in to your account" 
                : "Create an account to get started with ShopZap"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={(v) => setActiveTab(v as "login" | "signup")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-sm">Login</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
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
                      <Label htmlFor="password" className="text-sm">Password</Label>
                      <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <PasswordInput
                      value={password}
                      onChange={setPassword}
                      placeholder="••••••••"
                    />
                    {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <span>Signing in</span>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm">Full Name</Label>
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
                    <Label htmlFor="registerEmail" className="text-sm">Email</Label>
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
                    <Label htmlFor="registerPassword" className="text-sm">Password</Label>
                    <PasswordInput
                      value={registerPassword}
                      onChange={setRegisterPassword}
                      placeholder="••••••••"
                      showGenerator={true}
                      onGenerate={handlePasswordGenerated}
                    />
                    {errors.registerPassword && <p className="text-destructive text-xs">{errors.registerPassword}</p>}
                    {!errors.registerPassword && registerPassword && (
                      <p className="text-xs text-muted-foreground">
                        Use 8+ characters with uppercase, lowercase, numbers, and symbols
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                    <PasswordInput
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword}</p>}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <span>Creating account</span>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 pt-0">
            <div className="text-center text-xs text-muted-foreground">
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
