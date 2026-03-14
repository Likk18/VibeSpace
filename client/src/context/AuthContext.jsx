import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await authAPI.getMe();
            setUser(response.data.data.user);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await authAPI.login({ email, password });
        const { user, token } = response.data.data;

        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);

        return user;
    };

    const loginWithToken = async (token) => {
        localStorage.setItem('token', token);
        setToken(token);
    };

    const register = async (name, email, password, mode, group_id = null) => {
        const response = await authAPI.register({ name, email, password, mode, group_id });
        const { user, token } = response.data.data;

        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);

        return user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const updateUser = (updates) => {
        setUser(prev => ({ ...prev, ...updates }));
    };

    const value = {
        user,
        loading,
        login,
        loginWithToken,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
