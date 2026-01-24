import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ Helper function to extract role correctly (Same logic as Login.jsx)
    const getRoleFromToken = (decoded) => {
        let role = decoded.roles || decoded.role || decoded.authorities;
        
        if (Array.isArray(role)) {
            role = role[0];
        }
        if (typeof role === 'object' && role.authority) {
            role = role.authority;
        }
        return role; // Returns "RECRUITER", "ROLE_RECRUITER", "STUDENT", etc.
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    logout();
                } else {
                    // ✅ Use the helper function here
                    setUser({
                        email: decoded.sub,
                        role: getRoleFromToken(decoded) 
                    });
                }
            } catch (error) {
                console.error("Invalid token", error);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        
        // ✅ And use the helper function here too
        setUser({
            email: decoded.sub,
            role: getRoleFromToken(decoded)
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};