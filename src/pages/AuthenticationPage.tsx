import React, { ChangeEvent, FormEvent, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/Authentication";
import { NotificationContext } from "../contexts/NotificationProvider";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Link } from "react-router-dom";
import {BackgroundBeams} from "../components/ui/background-beams";

interface LoginRequestData {
    email: string;
    password: string;
}

export default function AuthenticationPage() {
    const inputRef = useRef<HTMLInputElement>(null);
    const { login, register, authState } = useAuth();
    const { showNotification } = useContext(NotificationContext);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEventInit) => {
            if (event.key === '§') {
                if (inputRef.current !== null) {
                    inputRef.current.focus();
                }
            }
        };
        window.addEventListener('keydown', handleKeyPress);

        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    useEffect(() => {
        if (authState.isAuthenticated) {
            window.location.href="/dashboard";
        }
    }, [authState.isAuthenticated]);

    const [formData, setFormData] = useState<LoginRequestData>({
        email: '',
        password: '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Logging in with', formData);
        login(formData.email, formData.password, () => {
            window.location.href="/playground"
        }, ()=>{showNotification("Authentication Issue", "Failed to authenticate.", "error", 5000)})
    };

    return (
      <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]  h-screen text-white">
          <div className="flex items-center justify-center py-12 h-full">
              <div className="mx-auto grid w-[350px] gap-6">
                  <div className="grid gap-2 text-center">
                      <h1 className="text-3xl font-bold">Login</h1>
                      <p className="text-balance text-muted-foreground">
                          Enter the realm of the infinite.
                      </p>
                  </div>
                  <form onSubmit={handleSubmit} className="grid gap-4">
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
                      <div className="grid gap-2">
                          <div className="flex items-center">
                              <Label htmlFor="password">Password</Label>
                              <Link
                                to="/forgot-password"
                                className="ml-auto inline-block text-sm underline"
                              >
                                  Forgot your password?
                              </Link>
                          </div>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                      </div>
                      <Button type="submit" className="w-full">
                          Login
                      </Button>
                      <Button variant="outline" className="w-full">
                          Login with Google
                      </Button>
                  </form>
                  <div className="mt-4 text-center text-sm">
                      Don&apos;t have an account?{" "}
                      <Link to="/" className="underline">
                          Sign up
                      </Link>
                  </div>
              </div>
          </div>
          <div className="relative hidden lg:block bg-emerald-200/20">
              <BackgroundBeams />
          </div>
      </div>
    );
}