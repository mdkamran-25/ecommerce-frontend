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
      <div className="flex items-center justify-center min-h-screen ">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
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

      <div className="max-w-md p-8 mx-auto mt-8 border border-gray-200 rounded-lg bg-black/10">
        <h1 className="mb-6 text-3xl font-bold text-center">Login</h1>

        {unverifiedEmail && (
          <div className="p-4 mb-6 border border-yellow-200 rounded-lg bg-yellow-50">
            <p className="mb-2 font-bold text-yellow-800">Email Not Verified</p>
            <p className="mb-4 text-sm text-yellow-700">
              Your account is pending verification. We sent a verification link
              to:
            </p>
            <p className="mb-4 font-bold text-center text-yellow-900">
              {unverifiedEmail}
            </p>
            <p className="mb-4 text-sm text-yellow-700">
              Please check your email (including spam folder) and click the
              verification link.
            </p>
            <button
              type="button"
              onClick={() => {
                setUnverifiedEmail("");
                setEmail(unverifiedEmail);
              }}
              className="w-full px-4 py-2 text-sm text-white transition bg-yellow-600 rounded hover:bg-yellow-700"
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
              className="w-full input-field"
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
                className="w-full pr-10 input-field"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-gray-600 right-3 top-3 hover:text-gray-800"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="mb-6 text-right">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading || authLoading}
            className="w-full btn-primary"
          >
            {isLoading || authLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-bold text-blue-600 hover:underline"
          >
            Sign up here
          </Link>
        </p>

        <p className="mt-4 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Back to home
          </Link>
        </p>
      </div>
    </>
  );
};

export default LoginPage;
