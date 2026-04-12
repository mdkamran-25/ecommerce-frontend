import { useState, useContext } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { AuthContext } from "../../context/AuthContext";
import * as authService from "../../services/authService";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data } = await authService.login(email, password);

      // Store tokens
      Cookies.set("accessToken", data.data.accessToken);
      Cookies.set("refreshToken", data.data.refreshToken);

      // Decode and set user
      const decoded = JSON.parse(atob(data.data.accessToken.split(".")[1]));
      setUser(decoded);

      // Redirect to home
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - eCommerce Store</title>
      </Head>

      <div className="max-w-md mx-auto mt-8 bg-white border border-gray-200 rounded-lg p-8">
        <h1 className="text-center text-3xl font-bold mb-6">Login</h1>

        {error && <div className="error">{error}</div>}

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

          <div className="mb-6">
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
              placeholder="Enter your password"
              required
              className="input-field w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Logging in..." : "Login"}
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
}
