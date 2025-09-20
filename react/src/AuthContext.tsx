import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  renderName: (name: string) => void;
  name: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Try to get initial state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedToken = localStorage.getItem('jwtToken');
    return !!savedToken; // If token exists, assume authenticated
  });

  const [name, setName] = useState<string | null>(() => {
    return localStorage.getItem('userName') || null;
  });

  // Login: save token and set state
  const login = () => {
    // Assume token was saved in localStorage elsewhere
    setIsAuthenticated(true);
    // Optionally ensure name is also persisted
    const savedName = localStorage.getItem('userName');
    if (savedName) setName(savedName);
  };

  // Logout: clear everything
  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setName(null);
  };

  // Update name and persist it
  const renderName = (userName: string) => {
    setName(userName);
    localStorage.setItem('userName', userName);
  };

  // Optional: Sync auth state if token is added/removed outside this context
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('jwtToken');
      setIsAuthenticated(!!token);
      const userName = localStorage.getItem('userName');
      setName(userName);
    };

    window.addEventListener('storage', handleStorageChange); // Listen for changes in other tabs

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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