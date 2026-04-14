import { useState, useEffect, useContext, JSX } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

/**
 * ResetPasswordPage
 * Validates reset token and allows password reset
 */

const API_URL = "http://localhost:5001/api";

interface AuthContextType {
  user: any;
}

interface PasswordStrength {
  level: number;
  color: string;
  text: string;
}

const getPasswordStrengthInfo = (strength: number): PasswordStrength => {
  const info: { [key: number]: PasswordStrength } = {
    0: { level: 0, color: "#999", text: "Very Weak" },
    1: { level: 1, color: "#dc3545", text: "Weak" },
    2: { level: 2, color: "#fd7e14", text: "Fair" },
    3: { level: 3, color: "#ffc107", text: "Good" },
    4: { level: 4, color: "#28a745", text: "Strong" },
    5: { level: 5, color: "#20c997", text: "Very Strong" },
  };
  return info[strength] || info[0];
};

const ResetPasswordPage = (): JSX.Element => {
  const router = useRouter();
  const { token } = router.query;
  const { user } = useContext(AuthContext) as AuthContextType;

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  /**
   * If already logged in, redirect to home
   */
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

  /**
   * Validate password strength
   */
  const validatePassword = (pwd: string): boolean => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(pwd);
  };

  /**
   * Calculate password strength (0-5)
   */
  const getPasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[@$!%*?&]/.test(pwd)) strength++;
    return strength;
  };

  /**
   * Handle reset password submission
   */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
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
    } catch (err: any) {
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

  /**
   * Invalid token
   */
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

  /**
   * Success state
   */
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

  const passwordStrength = getPasswordStrength(password);
  const strengthInfo = getPasswordStrengthInfo(passwordStrength);

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

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
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
                placeholder="Min 8 chars: uppercase, lowercase, number, special char (@$!%*?&)"
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
              <div className="mt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    Password Strength:
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded"
                    style={{
                      backgroundColor: strengthInfo.color,
                      color: "white",
                    }}
                  >
                    {strengthInfo.text}
                  </span>
                </div>
                <div
                  style={{
                    height: "4px",
                    backgroundColor: "#ddd",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: strengthInfo.color,
                      transition: "width 0.3s ease",
                    }}
                  ></div>
                </div>
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
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              className="w-full input-field"
            />
            {password && confirmPassword && password === confirmPassword && (
              <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
            )}
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-600 mt-1">
                ✗ Passwords do not match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          <Link
            href="/auth/login"
            className="text-blue-600 font-bold hover:underline"
          >
            Back to login
          </Link>
        </p>
      </div>
    </>
  );
};

export default ResetPasswordPage;
