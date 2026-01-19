import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; 

// 1. Create Context (Remove 'export' to fix the error)
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Ensure we handle the specific structure of your JWT
                setUser({ 
                    email: decoded.sub, 
                    role: decoded.roles || decoded.role, // Handle potential key differences
                    token 
                });
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        setUser({ 
            email: decoded.sub, 
            role: decoded.roles || decoded.role, 
            token 
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// 2. Export a Custom Hook instead of the Context
export const useAuth = () => {
    return useContext(AuthContext);
};