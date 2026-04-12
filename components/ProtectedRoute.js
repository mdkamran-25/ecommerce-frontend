import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    // If not loading yet and no user is logged in, redirect to login
    if (!loading && !user) {
      toast.warning("Please login to access this page");
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user exists, render the protected content
  if (user) {
    return <>{children}</>;
  }

  // User is not authenticated, return null (redirect happens in useEffect)
  return null;
}
