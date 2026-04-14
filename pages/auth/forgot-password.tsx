import { useState, useContext, useEffect, JSX } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

/**
 * ForgotPasswordPage
 * Password reset request page
 */

const API_URL = "http://localhost:5001/api";

interface AuthContextType {
  user: any;
  loading: boolean;
}

const ForgotPasswordPage = (): JSX.Element => {
  const router = useRouter();
  const { user, loading: authLoading } = useContext(
    AuthContext,
  ) as AuthContextType;

  const [email, setEmail] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Auth guard: Redirect logged-in users
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
   * Validate email format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Handle forgot password submission
   */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    // Checkpoint 1: Email filled
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Checkpoint 2: Email format validation
    if (!validateEmail(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(`${API_URL}/auth/forgot-password`, {
        email: email.toLowerCase().trim(),
      });

      setSuccess(true);
      toast.success("Reset email sent! Check your inbox for the link.");
    } catch (err: any) {
      const errorMessage = err.response?.data?.error;

      if (errorMessage?.includes("not found")) {
        toast.error("No account found with this email address");
      } else if (errorMessage?.includes("already")) {
        toast.error(
          "A password reset email was recently sent. Please check your inbox.",
        );
      } else {
        toast.error(
          errorMessage || "Failed to send reset email. Please try again.",
        );
      }
      console.error("Forgot password error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Success state
   */
  if (success) {
    return (
      <>
        <Head>
          <title>Password Reset Sent - eCommerce Store</title>
        </Head>

        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md p-8 bg-white border border-green-200 rounded-lg">
            <div className="text-center">
              <div className="mb-4 text-5xl text-green-500">✓</div>
              <h2 className="mb-4 text-2xl font-bold text-gray-800">
                Reset Email Sent!
              </h2>
              <p className="mb-4 text-gray-600">
                We've sent a password reset link to:
              </p>
              <p className="mb-6 text-lg font-bold text-gray-800">{email}</p>

              <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
                <p className="mb-3 text-sm text-gray-700">
                  <strong>What to do next:</strong>
                </p>
                <ol className="space-y-2 text-sm text-left text-gray-600 list-decimal list-inside">
                  <li>Check your email inbox</li>
                  <li>Click the password reset link</li>
                  <li>Enter your new password</li>
                  <li>Log in with your new password</li>
                </ol>
              </div>

              <p className="mb-6 text-sm text-gray-600">
                The reset link is valid for 1 hour.
              </p>

              <div className="p-3 mb-6 border border-yellow-200 rounded-lg bg-yellow-50">
                <p className="text-sm text-yellow-800">
                  💡 Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setEmail("");
                    }}
                    className="text-yellow-900 font-bold underline hover:text-yellow-700"
                  >
                    try again with a different email
                  </button>
                </p>
              </div>

              <Link
                href="/auth/login"
                className="inline-block w-full px-6 py-2 mb-4 font-medium text-center text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Back to Login
              </Link>

              <p className="text-sm text-gray-500">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Log in instead
                </Link>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Forgot Password - eCommerce Store</title>
      </Head>

      <div className="max-w-md p-8 mx-auto mt-8 bg-white border border-gray-200 rounded-lg">
        <h1 className="mb-2 text-3xl font-bold text-center">
          Forgot Password?
        </h1>
        <p className="mb-6 text-center text-gray-600">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <form onSubmit={handleSubmit}>
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
            {email && !validateEmail(email.trim()) && (
              <p className="mt-2 text-sm text-red-600">
                ✗ Please enter a valid email
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 font-bold hover:underline"
          >
            Log in instead
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

export default ForgotPasswordPage;
