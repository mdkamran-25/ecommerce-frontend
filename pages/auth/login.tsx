import { useState, useContext, useEffect, JSX } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

/**
 * LoginPage
 * User authentication and login page
 */

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  error?: string;
}

const LoginPage = (): JSX.Element => {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    login,
  } = useContext(AuthContext) as AuthContextType;

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Validate email format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Auth guard: Redirect logged-in users away from login
   */
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  /**
   * Show loading state while checking authentication
   */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  /**
   * If user is logged in, don't render form
   */
  if (user) {
    return null;
  }

  /**
   * Handle login submission
   */
  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    // Checkpoint 1: Fields filled
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    // Checkpoint 2: Email format validation
    if (!validateEmail(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Checkpoint 3: Password length check
    if (password.length < 1) {
      toast.error("Please enter your password");
      return;
    }

    try {
      setIsLoading(true);
      console.log("🔐 Initiating login for:", email);

      const result = await login(email, password);
      console.log("✅ Login successful, result:", result);

      // Wait a moment for user state to update
      setTimeout(() => {
        console.log("🚀 Redirecting to home...");
        router.push("/");
      }, 500);
    } catch (err: any) {
      console.error("❌ Login failed:", err);

      const errorMessage = err.response?.data?.error;
      const requiresVerification = err.response?.data?.requiresVerification;
      const unverifiedEmailAddr = err.response?.data?.email;

      if (requiresVerification) {
        console.warn("⚠️ Email not verified");
        setUnverifiedEmail(unverifiedEmailAddr || email);
        toast.warning("Please verify your email to continue");
      } else if (errorMessage?.includes("not found")) {
        console.warn("⚠️ Email not found");
        toast.error("Email not found. Please sign up first.");
      } else if (
        errorMessage?.includes("incorrect") ||
        errorMessage?.includes("Invalid")
      ) {
        console.warn("⚠️ Invalid credentials");
        toast.error("Incorrect email or password. Please try again.");
      } else if (errorMessage?.includes("Admin")) {
        console.warn("⚠️ Admin account attempted");
        toast.error(errorMessage);
      } else {
        console.error("❌ Unknown error:", errorMessage);
        toast.error(errorMessage || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - eCommerce Store</title>
      </Head>

      <div className="max-w-md mx-auto mt-8 bg-white border border-gray-200 rounded-lg p-8">
        <h1 className="text-center text-3xl font-bold mb-6">Login</h1>

        {unverifiedEmail && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-bold mb-2">Email Not Verified</p>
            <p className="text-yellow-700 text-sm mb-4">
              Your account is pending verification. We sent a verification link
              to:
            </p>
            <p className="text-yellow-900 font-bold text-center mb-4">
              {unverifiedEmail}
            </p>
            <p className="text-yellow-700 text-sm mb-4">
              Please check your email (including spam folder) and click the
              verification link.
            </p>
            <button
              type="button"
              onClick={() => {
                setUnverifiedEmail("");
                setEmail(unverifiedEmail);
              }}
              className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition text-sm"
            >
              Try Different Email
            </button>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block mb-2 font-bold text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="input-field w-full"
            />
          </div>

          <div className="mb-2">
            <label
              htmlFor="password"
              className="block mb-2 font-bold text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="input-field w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="mb-6 text-right">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:underline font-semibold"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading || authLoading}
            className="btn-primary w-full"
          >
            {isLoading || authLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-blue-600 font-bold hover:underline"
          >
            Sign up here
          </Link>
        </p>

        <p className="text-center mt-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Back to home
          </Link>
        </p>
      </div>
    </>
  );
};

export default LoginPage;
