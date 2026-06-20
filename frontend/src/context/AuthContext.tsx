import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../api/client';

export interface UserProfile {
    id: string;
    email: string;
    displayName?: string;
    role: 'CANDIDATE' | 'HR' | 'ADMIN';
}

interface AuthContextType {
    user: UserProfile | null;
    isLoading: boolean;
    error: string | null;

    login: (token: string, user: UserProfile) => void;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    registerWithEmail: (email: string, password: string, displayName: string, role: 'CANDIDATE' | 'HR') => Promise<void>;
    logout: () => Promise<void>;
    getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    error: null,
    login: () => { },
    loginWithEmail: async () => { },
    registerWithEmail: async () => { },
    logout: async () => { },
    getToken: () => null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const response = await apiClient.get('/auth/me');
            setUser(response.data.user);
        } catch (err) {
            console.error('Auth check failed', err);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const loginWithEmail = async (email: string, password: string) => {
        setError(null);
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(message);
            throw new Error(message);
        }
    };

    const registerWithEmail = async (
        email: string,
        password: string,
        displayName: string,
        role: 'CANDIDATE' | 'HR'
    ) => {
        setError(null);
        try {
            const response = await apiClient.post('/auth/register', { email, password, displayName, role });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Registration failed.';
            setError(message);
            throw new Error(message);
        }
    };

    const login = (token: string, user: UserProfile) => {
        localStorage.setItem('token', token);
        setUser(user);
    };

    const logout = async () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const getToken = () => localStorage.getItem('token');

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            error,
            login,
            loginWithEmail,
            registerWithEmail,
            logout,
            getToken,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

