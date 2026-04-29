import { useState, useContext, useEffect, JSX } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

/**
 * SignupPage
 * User registration and account creation page
 */

const API_URL = "http://localhost:5001/api";

interface AuthContextType {
  user: any;
  loading: boolean;
}

/**
 * Password Strength Indicator
 */
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

const SignupPage = (): JSX.Element => {
  const router = useRouter();
  const { user, loading: authLoading } = useContext(
    AuthContext,
  ) as AuthContextType;

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [signupSuccess, setSignupSuccess] = useState<boolean>(false);
  const [signupEmail, setSignupEmail] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  /**
   * Auth guard: Redirect logged-in users away from signup
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
   * Validate email format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate name format
   */
  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
    return nameRegex.test(name);
  };

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
   * Handle signup submission
   */
  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    // Checkpoint 1: All fields filled
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    // Checkpoint 2: Name validation
    if (!validateName(firstName.trim())) {
      toast.error("First name must contain only letters (2-50 characters)");
      return;
    }

    if (!validateName(lastName.trim())) {
      toast.error("Last name must contain only letters (2-50 characters)");
      return;
    }

    // Checkpoint 3: Email format validation
    if (!validateEmail(email.toLowerCase().trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Checkpoint 4: Password strength
    if (!validatePassword(password)) {
      toast.error(
        "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character (@$!%*?&)",
      );
      return;
    }

    // Checkpoint 5: Passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(`${API_URL}/auth/signup`, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password,
      });

      // Show success message
      toast.success("Account created! Check your email to verify.");
      setSignupSuccess(true);
      setSignupEmail(email);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error || "Sign up failed. Please try again.";
      toast.error(errorMsg);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Show success message after signup
   */
  if (signupSuccess) {
    return (
      <>
        <Head>
          <title>Verify Email - eCommerce Store</title>
        </Head>

        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="w-full max-w-md p-8 bg-white border border-green-200 rounded-lg">
            <div className="text-center">
              <div className="mb-4 text-5xl text-green-500">✓</div>
              <h2 className="mb-4 text-2xl font-bold text-gray-800">
                Account Created!
              </h2>
              <p className="mb-4 text-gray-600">
                We've sent a verification email to:
              </p>
              <p className="mb-6 text-lg font-bold text-gray-800">
                {signupEmail}
              </p>

              <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
                <p className="mb-3 text-sm text-gray-700">
                  <strong>Next steps:</strong>
                </p>
                <ol className="space-y-2 text-sm text-left text-gray-600 list-decimal list-inside">
                  <li>Check your inbox and spam folder</li>
                  <li>Click the verification link in the email</li>
                  <li>Your account will be activated</li>
                  <li>You can then log in with your password</li>
                </ol>
              </div>

              <p className="mb-6 text-sm text-gray-600">
                The verification link is valid for 24 hours.
              </p>

              <div className="p-3 mb-6 border border-yellow-200 rounded-lg bg-yellow-50">
                <p className="text-sm text-yellow-800">
                  💡 Didn't receive the email? Check your spam folder or resend
                  the verification link from the login page.
                </p>
              </div>

              <Link
                href="/auth/login"
                className="inline-block w-full px-6 py-2 mb-4 font-medium text-center text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Go to Login
              </Link>

              <p className="text-sm text-gray-500">
                <button
                  type="button"
                  onClick={() => {
                    setSignupSuccess(false);
                    setFirstName("");
                    setLastName("");
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Create a different account
                </button>
              </p>
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
        <title>Sign Up - eCommerce Store</title>
      </Head>

      <div className="max-w-md p-8 mx-auto mt-8 bg-white border border-gray-200 rounded-lg">
        <h1 className="mb-6 text-3xl font-bold text-center">Create Account</h1>

        <form onSubmit={handleSignup}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="firstName"
                className="block mb-2 font-bold text-gray-700"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                required
                className="w-full input-field"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block mb-2 font-bold text-gray-700"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
                className="w-full input-field"
              />
            </div>
          </div>

          <div className="mb-4">
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

          <div className="mb-4">
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
                placeholder="Min 8 chars: uppercase, lowercase, number, special char (@$!%*?&)"
                required
                className="w-full pr-10 input-field"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
            {password && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Password Strength:
                  </span>
                  <span
                    className="px-2 py-1 text-xs font-bold rounded"
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
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className="w-full pr-10 input-field"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
            {password && confirmPassword && password === confirmPassword && (
              <p className="mt-1 text-xs text-green-600">✓ Passwords match</p>
            )}
            {password && confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                ✗ Passwords do not match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mb-4 btn-primary"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="text-center text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-bold text-blue-600 hover:underline"
            >
              Log in here
            </Link>
          </p>

          <p className="mt-4 text-center">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Back to home
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default SignupPage;
