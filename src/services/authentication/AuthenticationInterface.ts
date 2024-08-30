import {User} from "../../types/User";

export interface AuthService {
    login(email: string, password: string): Promise<User | null>;
    logout(): Promise<void>;
    register(email: string, password: string, name: string): Promise<User | null>;
    onAuthStateChanged(callback: (user: User | null) => void): () => void;
    resetPassword(email: string): Promise<void>;
}

export default AuthService;