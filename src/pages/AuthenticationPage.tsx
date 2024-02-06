import React, {ChangeEvent, FormEvent, MutableRefObject, useEffect, useRef, useState} from "react";
import ScrollableLayout from "../layouts/ScrollableLayout";
import {type} from "os";

interface LoginRequestData {
    email: string;
    password: string;
}

export default function AuthenticationPage() {
    const inputRef = useRef<HTMLInputElement>(null);

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
    };

    return <ScrollableLayout>
        <div className={"container m-auto flex flex-col min-h-[70vh] justify-center items-center gap-2 text-accent"}>
            <h1 className={"text-title"}>
                Login
            </h1>
            <p className={"text-accent"}>Enter the realm of the infinite.</p>

            <form onSubmit={handleSubmit} className={"flex flex-col gap-5 max-w-[500px] w-full"}>
                <div className={"flex flex-col w-full"}>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="email"
                        name="email"
                        ref={inputRef}
                        value={formData.email}
                        onChange={handleChange}
                        className={"bg-black border-secondary border w-full min-h-[40px] rounded p-2 focus:outline-none focus:ring-indigo-500 focus:border-primary"}
                    />
                </div>
                <div className={"flex flex-col w-full"}>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={"bg-black border-secondary border w-full min-h-[40px] rounded p-2 focus:outline-none focus:ring-indigo-500 focus:border-primary"}
                    />
                </div>
                <button type="submit" className={"py-2 px-5 border-primary bg-secondary rounded hover:bg-primary hover:text-black focus:bg-primary focus:text-black"}>Login</button>

            </form>
        </div>
    </ScrollableLayout>
};