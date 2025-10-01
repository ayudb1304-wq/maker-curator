import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Palette, ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUsernameCheck } from '@/hooks/useUsernameCheck';
import { cn } from '@/lib/utils';

const Login = () => {
  const { user, signIn, signUp, resetPassword, signInWithGoogle, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [occupation, setOccupation] = useState('');
  const [gender, setGender] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Determine initial tab based on URL parameters
    const urlTab = searchParams.get('tab');
    const urlUsername = searchParams.get('username');
    if (urlUsername || urlTab === 'signup') return 'signup';
    return 'signin';
  });
  
  const usernameCheck = useUsernameCheck(username);

  // Handle URL parameters and initialize tab state
  useEffect(() => {
    const verified = searchParams.get('verified');
    const reset = searchParams.get('reset');
    const usernameParam = searchParams.get('username');
    const tabParam = searchParams.get('tab');
    
    // Set initial tab based on URL parameters
    if (usernameParam || tabParam === 'signup') {
      setActiveTab('signup');
    }
    
    if (usernameParam) {
      setUsername(usernameParam);
    }
    
    if (verified === 'true') {
      toast({
        title: "Email verified successfully!",
        description: "Your account has been verified. You can now sign in.",
      });
      // Clear the URL parameter
      navigate('/auth', { replace: true });
    }
    
    if (reset === 'true') {
      toast({
        title: "Password reset link confirmed",
        description: "Please enter your new password below.",
      });
      // Clear the URL parameter
      navigate('/auth', { replace: true });
    }
  }, [searchParams, navigate, toast]);

  // Show loading spinner while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSignupSuccess(false); // Reset success state
    
    // Basic validation
    if (!email || !password || !username) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    
    // Validate username availability before proceeding (but don't block if check failed)
    if (username.length >= 3 && usernameCheck.available === false && usernameCheck.message !== 'Error checking username availability') {
      setError(usernameCheck.message || 'Please choose a different username');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, {
        username: username.toLowerCase().trim(),
        occupation,
        gender,
        display_name: username
      });
      
      if (error) {
        setError(error.message);
      } else {
        setSignupSuccess(true);
        setActiveTab('signin'); // Switch to signin tab after successful signup
        // Clear the form but stay on the auth page
        setEmail('');
        setPassword('');
        setUsername('');
        setOccupation('');
        setGender('');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(resetEmail);
      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "Reset link sent!",
          description: "Please check your email for password reset instructions.",
        });
        setShowResetForm(false);
        setResetEmail('');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    await signInWithGoogle(username);
  };

  if (showResetForm) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Curately
              </span>
            </div>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="h-14 text-base min-h-[56px]"
                />
              </div>
              <Button type="submit" size="mobile" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="mobile"
                className="w-full"
                onClick={() => setShowResetForm(false)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Curately
            </span>
          </div>
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </CardHeader>
        <CardContent>
          <Tabs value={signupSuccess ? "signin" : activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              {signupSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Please verify your email!</strong><br />
                    Check your email and click the verification link, then sign in here.
                  </AlertDescription>
                </Alert>
              )}
              <div className="text-center">
                <h2 className="text-lg font-semibold">Welcome back</h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to your Curately account
                </p>
              </div>
              
              <form onSubmit={handleSignIn} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="h-14 text-base min-h-[56px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-14 text-base min-h-[56px]"
                  />
                </div>
                <Button type="submit" size="mobile" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                <Button variant="outline" size="mobile" className="w-full" onClick={handleGoogleSignIn}>
                  Sign In with Google
                </Button>
                <button
                  type="button"
                  onClick={() => setShowResetForm(true)}
                  className="w-full text-sm text-primary hover:underline mb-2"
                >
                  Forgot your password?
                </button>
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('signup')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up here
                  </button>
                </p>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-semibold">Create account</h2>
                <p className="text-sm text-muted-foreground">
                  Join Curately and start building your recommendations
                </p>
              </div>
              
              <form onSubmit={handleSignUp} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="h-14 text-base min-h-[56px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <div className="relative">
                      <Input
                        id="signup-username"
                        type="text"
                        inputMode="text"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        placeholder="Choose username"
                        className={cn(
                          "h-14 text-base pr-12 min-h-[56px]",
                          username.length >= 3 && !usernameCheck.isChecking && 
                          (usernameCheck.available ? "border-green-500" : "border-red-500")
                        )}
                        required
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {username.length >= 3 && (
                          <>
                            {usernameCheck.isChecking && (
                              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            )}
                            {!usernameCheck.isChecking && usernameCheck.available && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            {!usernameCheck.isChecking && !usernameCheck.available && (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {username.length >= 3 && usernameCheck.message && (
                      <p className={cn(
                        "text-sm px-1 py-1",
                        usernameCheck.available ? "text-green-600" : "text-red-600"
                      )}>
                        {usernameCheck.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="h-14 text-base min-h-[56px]"
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation (Optional)</Label>
                    <Input
                      id="occupation"
                      type="text"
                      inputMode="text"
                      autoComplete="organization-title"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="Your profession"
                      className="h-14 text-base min-h-[56px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender (Optional)</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="h-14 text-base min-h-[56px]">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  size="mobile"
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in here
                  </button>
                </p>
                
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;