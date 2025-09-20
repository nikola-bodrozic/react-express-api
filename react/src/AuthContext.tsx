import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from './axiosConfig';

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
    renderName: (name: string) => void;
    name: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [name, setName] = useState<string | null>(null);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            axios.get('/me')
                .then(res => {
                    setIsAuthenticated(true);
                    setName(res.data.username);
                })
                .catch(() => {
                    setIsAuthenticated(false);
                    setName(null);
                });
        };
        checkAuth();
    }, []);

    const login = () => {
        // After successful login, re-check auth status
        setIsAuthenticated(true);
        // Optionally re-fetch user info
        axios.get('/me')
            .then((res: any) => setName(res.data.username))
            .catch(() => setName(null));
    };

    const logout = async () => {
        try {
            await axios.post('/logout', {});
        } catch (err) {
            console.error('Logout failed:', err);
        }
        setIsAuthenticated(false);
        setName(null);
    };

    const renderName = (userName: string) => {
        setName(userName);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, renderName, name }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
