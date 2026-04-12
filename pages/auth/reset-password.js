import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const API_URL = "http://localhost:5001/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  const { user } = useContext(AuthContext);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  // If already logged in, redirect to home
  useEffect(() => {
    if (user) {
      router.push("/");
      return;
    }

    // Validate token exists
    if (!router.isReady) return;

    if (!token) {
      setTokenValid(false);
      toast.error("Invalid reset link. Please request a new password reset.");
    } else {
      setTokenValid(true);
    }
  }, [user, router.isReady, token, router]);

  // Validation helpers
  const validatePassword = (pwd) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(pwd);
  };

  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[@$!%*?&]/.test(pwd)) strength++;
    return strength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Checkpoint 1: Fields filled
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    // Checkpoint 2: Password strength
    if (!validatePassword(password)) {
      toast.error(
        "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character (@$!%*?&)",
      );
      return;
    }

    // Checkpoint 3: Passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword: password,
      });

      setSuccess(true);
      toast.success("Password reset successfully! Redirecting to login...");
    } catch (err) {
      const errorMessage = err.response?.data?.error;

      if (errorMessage?.includes("expired")) {
        toast.error(
          "Reset link has expired. Please request a new password reset.",
        );
      } else if (errorMessage?.includes("invalid")) {
        toast.error("Invalid reset link. Please request a new password reset.");
      } else {
        toast.error(
          errorMessage || "Failed to reset password. Please try again.",
        );
      }
      console.error("Reset password error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Invalid token
  if (tokenValid === false) {
    return (
      <>
        <Head>
          <title>Invalid Reset Link - eCommerce Store</title>
        </Head>

        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md p-8 bg-white border border-red-200 rounded-lg">
            <div className="text-center">
              <div className="mb-4 text-5xl text-red-500">✗</div>
              <h2 className="mb-4 text-2xl font-bold text-gray-800">
                Invalid Reset Link
              </h2>
              <p className="mb-6 text-gray-600">
                The password reset link is invalid or has expired.
              </p>

              <Link
                href="/auth/forgot-password"
                className="inline-block w-full px-6 py-2 mb-4 font-medium text-center text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Request New Reset Link
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

  // Success state
  if (success) {
    return (
      <>
        <Head>
          <title>Password Reset - eCommerce Store</title>
        </Head>

        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md p-8 bg-white border border-green-200 rounded-lg">
            <div className="text-center">
              <div className="mb-4 text-5xl text-green-500">✓</div>
              <h2 className="mb-4 text-2xl font-bold text-gray-800">
                Password Reset Successful!
              </h2>
              <p className="mb-6 text-gray-600">
                Your password has been reset successfully.
              </p>

              <p className="mb-6 text-sm text-gray-600">
                You can now log in with your new password.
              </p>

              <Link
                href="/auth/login"
                className="inline-block w-full px-6 py-2 font-medium text-center text-white transition bg-green-600 rounded-lg hover:bg-green-700"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Reset Password - eCommerce Store</title>
      </Head>

      <div className="max-w-md p-8 mx-auto mt-8 bg-white border border-gray-200 rounded-lg">
        <h1 className="mb-2 text-3xl font-bold text-center">Reset Password</h1>
        <p className="mb-6 text-center text-gray-600">
          Enter your new password below.
        </p>

        {tokenValid === true && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block mb-2 font-bold text-gray-700"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars: uppercase, lowercase, number, special char"
                  required
                  className="w-full input-field pr-10"
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

              {password && (
                <div className="mt-3 space-y-2">
                  <div className="text-sm font-semibold text-gray-700">
                    Password Strength:
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded ${
                          getPasswordStrength(password) >= level
                            ? level <= 2
                              ? "bg-red-500"
                              : level <= 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {!validatePassword(password) && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      <strong>Password must have:</strong>
                      <ul className="mt-1 space-y-1 list-inside list-disc">
                        <li
                          className={
                            password.length >= 8 ? "text-green-600" : ""
                          }
                        >
                          {password.length >= 8 ? "✓" : "✗"} At least 8
                          characters
                        </li>
                        <li
                          className={
                            /[a-z]/.test(password) ? "text-green-600" : ""
                          }
                        >
                          {/[a-z]/.test(password) ? "✓" : "✗"} Lowercase letter
                          (a-z)
                        </li>
                        <li
                          className={
                            /[A-Z]/.test(password) ? "text-green-600" : ""
                          }
                        >
                          {/[A-Z]/.test(password) ? "✓" : "✗"} Uppercase letter
                          (A-Z)
                        </li>
                        <li
                          className={
                            /\d/.test(password) ? "text-green-600" : ""
                          }
                        >
                          {/\d/.test(password) ? "✓" : "✗"} Number (0-9)
                        </li>
                        <li
                          className={
                            /[@$!%*?&]/.test(password) ? "text-green-600" : ""
                          }
                        >
                          {/[@$!%*?&]/.test(password) ? "✓" : "✗"} Special
                          character (@$!%*?&)
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block mb-2 font-bold text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full input-field"
              />
              {password && confirmPassword && password !== confirmPassword && (
                <div className="mt-2 text-sm text-red-600">
                  ✗ Passwords do not match
                </div>
              )}
              {password && confirmPassword && password === confirmPassword && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ Passwords match
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-success"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
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
    </>
  );
}
