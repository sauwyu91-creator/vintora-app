
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    useCallback,
} from "react";

import * as authService from "../services/auth.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => authService.getUser());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const updateUser = (nextUser) => {
            if (mounted) {
                setUser(nextUser);
                setLoading(false);
            }
        };

        const unsubscribe = authService.onAuthStateChange(updateUser);

        // Backend se current user verify karo.
        const checkCurrentUser = async () => {
            try {
                if (localStorage.getItem("vintora_token")) {
                    const nextUser = await authService.getCurrentUser();

                    if (mounted) {
                        setUser(nextUser);
                    }
                } else if (mounted) {
                    setUser(null);
                }
            } catch (error) {
                console.error("Current user load nahi hua:", error);
                if (mounted) {
                    setUser(null);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        checkCurrentUser();

        return () => {
            mounted = false;

            if (typeof unsubscribe === "function") {
                unsubscribe();
            }
        };
    }, []);

    const signup = useCallback(async (...args) => {
        const result = await authService.signup(...args);

        if (result?.data?.user) {
            setUser(result.data.user);
        }

        return result;
    }, []);

    const login = useCallback(async (...args) => {
        const result = await authService.login(...args);

        if (result?.data?.user) {
            setUser(result.data.user);
        }

        return result;
    }, []);

    const logout = useCallback(async (...args) => {
        const result = await authService.logout(...args);
        setUser(null);
        return result;
    }, []);

    const resetPassword = useCallback(
        (...args) => authService.resetPassword(...args),
        []
    );

    const value = useMemo(
        () => ({
            user,
            loading,
            signup,
            login,
            logout,
            resetPassword,
        }),
        [user, loading, signup, login, logout, resetPassword]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth ko AuthProvider ke andar use karo");
    }

    return context;
};

export default AuthContext;
