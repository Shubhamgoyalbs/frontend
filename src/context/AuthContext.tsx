"use client";

import {createContext, useContext, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import { getUserPrimaryRoleFromToken, isTokenExpired } from "@/utils/jwtUtils";

interface AuthContextType {
    token: string | null;
    role: string | null;
    loading: boolean; // Add loading state to the context type
    login: (token: string, role: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // Initialize loading as true

    useEffect(() => {
        const storedToken = localStorage.getItem("token");

        if (storedToken) {
            // Check if token is expired
            if (isTokenExpired(storedToken)) {
                // Clean up expired token
                localStorage.removeItem("token");
                localStorage.removeItem("role"); // Clean up old role storage
                setLoading(false);
                return;
            }

            // Extract role from JWT token
            const roleFromToken = getUserPrimaryRoleFromToken(storedToken);
            
            if (roleFromToken) {
                setToken(storedToken);
                setRole(roleFromToken);
                // Remove old role from localStorage if it exists
                localStorage.removeItem("role");
            }
        }
        setLoading(false);
    }, []);

    const login = (newToken: string, newRole?: string) => {
        setToken(newToken);
        
        // Extract role from token if not provided
        const roleFromToken = newRole || getUserPrimaryRoleFromToken(newToken);
        setRole(roleFromToken);
        
        // Only store token, role comes from JWT
        localStorage.setItem("token", newToken);
        // Remove old role storage
        localStorage.removeItem("role");
    };

    const logout = () => {
        setToken(null);
        setRole(null);
        localStorage.removeItem("token");
        localStorage.removeItem("role"); // Clean up old role storage
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{token, role, loading, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};