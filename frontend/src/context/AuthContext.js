import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const API_URL = "http://localhost:5000/api";
export const BASE_URL = "http://localhost:5000";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Configure Axios token
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            localStorage.setItem("token", token);
        } else {
            delete axios.defaults.headers.common["Authorization"];
            localStorage.removeItem("token");
        }
    }, [token]);

    // Check if user is logged in on mount
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }
            try {
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                const res = await axios.get(`${API_URL}/auth/me`);
                if (res.data.success) {
                    setUser(res.data.user);
                } else {
                    logout();
                }
            } catch (err) {
                console.error("Load user error:", err);
                logout();
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [token]);

    // Login user
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            if (res.data.success) {
                setToken(res.data.token);
                setUser(res.data.user);
                return { success: true, user: res.data.user };
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Invalid credentials";
            setError(msg);
            setLoading(false);
            return { success: false, message: msg };
        }
    };

    // Register user (takes FormData because student registration includes files)
    const register = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/auth/register`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            setLoading(false);
            if (res.data.success) {
                return { success: true, message: res.data.message };
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Registration failed. Please check input values.";
            setError(msg);
            setLoading(false);
            return { success: false, message: msg };
        }
    };

    // Logout user
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                error,
                login,
                register,
                logout,
                setUser,
                setError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
