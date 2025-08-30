import { apiClient } from "@/lib/api";
import type { User } from "@/type";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  handleSignUp: (email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const isAuthenticated = !!user;
  const navigate = useNavigate();

  const checkAuth = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded: User = jwtDecode(token);
        setUser(decoded);
        navigate("/");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        const decoded: User = jwtDecode(response.data.token);
        setUser(decoded);
        navigate("/");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.error("Login failed:", error.response?.data.message);
        toast.error(error.response?.data.message);
        console.error("No response from server:", error.request);
        toast.error("Unable to connect to server. Please try again.");
      } else {
        console.error("Error during login:", (error as Error).message);
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  const handleSignUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/register", {
        email,
        password,
      });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        const decoded: User = jwtDecode(response.data.token);
        setUser(decoded);
        navigate("/");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.error("Sign up failed:", error.response?.data.message);
        toast.error(error.response?.data.message);
        console.error("No response from server:", error.request);
        toast.error("Unable to connect to server. Please try again.");
      } else {
        console.error("Error during sign up:", (error as Error).message);
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        setUser,
        handleSignUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
