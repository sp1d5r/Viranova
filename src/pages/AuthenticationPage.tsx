import React, { ChangeEvent, FormEvent, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/Authentication";
import { NotificationContext } from "../contexts/NotificationProvider";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { BackgroundBeams } from "../components/ui/background-beams";

interface AuthData {
    email: string;
    password: string;
    name?: string;
}

type AuthMode = 'login' | 'register' | 'forgot';

export default function AuthenticationPage() {
    const inputRef = useRef<HTMLInputElement>(null);
    const { login, register, resetPassword, authState } = useAuth();
    const { showNotification } = useContext(NotificationContext);
    const [authMode, setAuthMode] = useState<AuthMode>('login');

    const [formData, setFormData] = useState<AuthData>({
        email: '',
        password: '',
        name: '',
    });

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === '§' && inputRef.current) {
                inputRef.current.focus();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    useEffect(() => {
        if (authState.isAuthenticated) {
            window.location.href = "/dashboard";
        }
    }, [authState.isAuthenticated]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        switch (authMode) {
            case 'login':
                login(formData.email, formData.password,
                  () => { window.location.href = "/dashboard" },
                  () => { showNotification("Authentication Issue", "Failed to authenticate.", "error", 5000) }
                );
                break;
            case 'register':
                register(formData.email, formData.name || '', formData.password,
                  () => { window.location.href = "/dashboard" },
                  (error) => { showNotification("Registration Error", error.message || "Failed to register.", "error", 5000) }
                );
                break;
            case 'forgot':
                resetPassword(formData.email,
                  () => {
                      showNotification("Password Reset", "If an account exists, you will receive an email with further instructions.", "success", 5000);
                      setAuthMode('login');
                  },
                  (error) => { showNotification("Reset Error", error.message || "Failed to initiate password reset.", "error", 5000) }
                );
                break;
        }
    };

    const handleGoogleSignIn = () => {
        console.log("Google Sign-In clicked");
        showNotification("Google Sign-In", "This feature is not yet implemented.", "info", 5000);
    };

    const getTitle = () => {
        switch (authMode) {
            case 'login': return "Login";
            case 'register': return "Sign Up";
            case 'forgot': return "Reset Password";
        }
    };

    return (
      <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] h-screen text-white">
          <div className="flex items-center justify-center py-12 h-full">
              <div className="mx-auto grid w-[350px] gap-6">
                  <div className="grid gap-2 text-center">
                      <h1 className="text-3xl font-bold">{getTitle()}</h1>
                      <p className="text-balance text-muted-foreground">
                          Enter the realm of the infinite.
                      </p>
                  </div>
                  <form onSubmit={handleSubmit} className="grid gap-4">
                      {authMode === 'register' && (
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="John Doe"
                              required={authMode === 'register'}
                            />
                        </div>
                      )}
                      <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            ref={inputRef}
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="m@example.com"
                            required
                          />
                      </div>
                      {authMode !== 'forgot' && (
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              name="password"
                              type="password"
                              value={formData.password}
                              onChange={handleChange}
                              required={true}
                            />
                        </div>
                      )}
                      <Button type="submit" className="w-full">
                          {getTitle()}
                      </Button>
                  </form>
                  {authMode !== 'forgot' && (
                    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                        {authMode === 'login' ? "Login" : "Sign up"} with Google
                    </Button>
                  )}
                  <div className="mt-4 text-center text-sm">
                      {authMode === 'login' && (
                        <>
                            <button onClick={() => setAuthMode('forgot')} className="underline">
                                Forgot password?
                            </button>
                            <span className="mx-2">|</span>
                            <button onClick={() => setAuthMode('register')} className="underline">
                                Sign up
                            </button>
                        </>
                      )}
                      {authMode === 'register' && (
                        <>
                            Already have an account?{" "}
                            <button onClick={() => setAuthMode('login')} className="underline">
                                Log in
                            </button>
                        </>
                      )}
                      {authMode === 'forgot' && (
                        <>
                            Remembered your password?{" "}
                            <button onClick={() => setAuthMode('login')} className="underline">
                                Log in
                            </button>
                        </>
                      )}
                  </div>
              </div>
          </div>
          <div className="relative hidden lg:block bg-emerald-200/20">
              <BackgroundBeams />
          </div>
      </div>
    );
}