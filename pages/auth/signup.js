import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const API_URL = "http://localhost:5001/api";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useContext(AuthContext);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

  // Auth Guard: Redirect logged-in users away from signup
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  // Show loading state while checking authentication
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

  // If user is logged in, don't render form
  if (user) {
    return null;
  }

  // Validation helper functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name) => {
    // Only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
    return nameRegex.test(name);
  };

  const validatePassword = (pwd) => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(pwd);
  };

  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[@$!%*?&]/.test(pwd)) strength++;
    return strength; // 0-5
  };

  const handleSignup = async (e) => {
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
        "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character (@$!%*?&)"
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
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Sign up failed. Please try again.";
      toast.error(errorMsg);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Show success message after signup
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
                <Link
                  href="/auth/signup"
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    setSignupSuccess(false);
                    setFirstName("");
                    setLastName("");
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Create a different account
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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars: uppercase, lowercase, number, special char (@$!%*?&)"
              required
              className="w-full input-field"
            />
            
            {password && (
              <div className="mt-3 space-y-2">
                <div className="text-sm font-semibold text-gray-700">Password Strength:</div>
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
                <div className="text-xs text-gray-600">
                  {getPasswordStrength(password) <= 2 && "Weak"}
                  {getPasswordStrength(password) === 3 && "Fair"}
                  {getPasswordStrength(password) === 4 && "Good"}
                  {getPasswordStrength(password) === 5 && "Strong"}
                </div>
                
                {password && !validatePassword(password) && (
                  <div className="p-3 mt-2 text-xs text-yellow-800 border border-yellow-200 rounded bg-yellow-50">
                    <strong>Password must have:</strong>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li className={password.length >= 8 ? "text-green-600" : ""}>
                        {password.length >= 8 ? "✓" : "✗"} At least 8 characters
                      </li>
                      <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>
                        {/[a-z]/.test(password) ? "✓" : "✗"} Lowercase letter (a-z)
                      </li>
                      <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
                        {/[A-Z]/.test(password) ? "✓" : "✗"} Uppercase letter (A-Z)
                      </li>
                      <li className={/\d/.test(password) ? "text-green-600" : ""}>
                        {/\d/.test(password) ? "✓" : "✗"} Number (0-9)
                      </li>
                      <li className={/[@$!%*?&]/.test(password) ? "text-green-600" : ""}>
                        {/[@$!%*?&]/.test(password) ? "✓" : "✗"} Special character (@$!%*?&)
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
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              className="w-full input-field"
            />
            {password && confirmPassword && password !== confirmPassword && (
              <div className="mt-2 text-sm text-red-600">✗ Passwords do not match</div>
            )}
            {password && confirmPassword && password === confirmPassword && (
              <div className="mt-2 text-sm text-green-600">✓ Passwords match</div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-success"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
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
      </div>
    </>
  );
}
