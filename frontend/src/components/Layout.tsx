import { type ReactNode } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Layout({ children }: { children: ReactNode }) {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate()
  return (
    <>
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <header className=" p-4 backdrop-blur-lg shadow-md  w-ful">
          <div className="flex items-center justify-between px-20">
            <h1 className="text-xl font-bold text-white">Todo App</h1>
            <div>
              {isAuthenticated ? (
                <Button onClick={logout}>Logout</Button>
              ) : (
                <div>
                  <Button onClick={() => navigate('/login')}>Login</Button>
                  <Button onClick={() => navigate('/signup')}>Sign Up</Button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="w-full h-full flex overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

export default Layout;
