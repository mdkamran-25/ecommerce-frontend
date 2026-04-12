import { useState, useContext } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { AuthContext } from "../../context/AuthContext";
import * as authService from "../../services/authService";
import Cookies from "js-cookie";

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useContext(AuthContext);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data } = await authService.signup(
        firstName,
        lastName,
        email,
        password,
      );

      // Store tokens
      Cookies.set("accessToken", data.data.accessToken);
      Cookies.set("refreshToken", data.data.refreshToken);

      // Decode and set user
      const decoded = JSON.parse(atob(data.data.accessToken.split(".")[1]));
      setUser(decoded);

      // Redirect to home
      router.push("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Sign up failed. Please try again.",
      );
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - eCommerce Store</title>
      </Head>

      <div className="max-w-md mx-auto mt-8 bg-white border border-gray-200 rounded-lg p-8">
        <h1 className="text-center text-3xl font-bold mb-6">Create Account</h1>

        {error && <div className="error">{error}</div>}

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
                className="input-field w-full"
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
                className="input-field w-full"
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
              className="input-field w-full"
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
              placeholder="Min 6 characters"
              required
              className="input-field w-full"
            />
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
              className="input-field w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-success w-full"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 font-bold hover:underline"
          >
            Log in here
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
}
