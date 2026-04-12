import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { AuthContext } from "../../context/AuthContext";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  const { user } = useContext(AuthContext);

  const [status, setStatus] = useState("loading"); // loading, success, error, redirecting
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // If already logged in with verified email, redirect to home
    if (user) {
      router.push("/");
      return;
    }

    // Wait for router to be ready before checking token
    if (!router.isReady) {
      return;
    }

    if (!token) {
      setStatus("error");
      setMessage("No verification token found");
      return;
    }

    const verifyEmail = async () => {
      try {
        setStatus("loading");

        const { data } = await axios.post(
          "http://localhost:5001/api/auth/verify-email",
          { token },
        );

        // Store tokens from response
        if (data.data.accessToken && data.data.refreshToken) {
          // Validate token is CUSTOMER role, not ADMIN
          const decoded = JSON.parse(atob(data.data.accessToken.split(".")[1]));

          if (decoded.role !== "CUSTOMER") {
            setStatus("error");
            setMessage("Invalid token. Please sign up again.");
            return;
          }

          // Store tokens with explicit domain and path settings
          const tokenSettings = {
            path: "/",
            expires: 0.625, // 15 minutes
            sameSite: "Lax",
          };

          Cookies.set("accessToken", data.data.accessToken, tokenSettings);
          Cookies.set("refreshToken", data.data.refreshToken, {
            path: "/",
            expires: 7, // 7 days
            sameSite: "Lax",
          });

          // Verify tokens were stored
          const storedToken = Cookies.get("accessToken");
          if (!storedToken) {
            setStatus("error");
            setMessage(
              "Failed to store authentication tokens. Please try again.",
            );
            return;
          }

          setStatus("success");
          setMessage(data.message || "Email verified successfully!");

          // Start countdown and redirect with hard refresh
          setCountdown(3);
          let count = 3;
          const countdownInterval = setInterval(() => {
            count--;
            if (count <= 0) {
              clearInterval(countdownInterval);
              setStatus("redirecting");
              // Use hard page reload (more reliable than router.push)
              // This forces AuthContext to re-initialize with new tokens
              setTimeout(() => {
                window.location.href = "/";
              }, 200);
            } else {
              setCountdown(count);
            }
          }, 1000);
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.error ||
            "Failed to verify email. Please try again.",
        );
        console.error("Verification error:", error);
      }
    };

    verifyEmail();
  }, [token, router.isReady, router]);

  return (
    <>
      <Head>
        <title>Verify Email - eCommerce Store</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg p-8">
          {status === "loading" && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Verifying Email
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="text-green-500 text-5xl">✓</div>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500">
                You are logged in. Redirecting to home in {countdown} seconds...
              </p>
              <div className="mt-6 flex justify-center">
                <div className="text-3xl font-bold text-green-600">
                  {countdown}
                </div>
              </div>
              <Link
                href="/"
                className="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Go to Home Now
              </Link>
            </div>
          )}

          {status === "redirecting" && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Redirecting...
              </h2>
              <p className="text-gray-600">Taking you to your home page...</p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="text-red-500 text-5xl">✗</div>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Link
                  href="/auth/signup"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up Again
                </Link>
                <p className="text-sm text-gray-500">
                  or{" "}
                  <Link
                    href="/auth/login"
                    className="text-blue-600 hover:underline"
                  >
                    go to login
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
