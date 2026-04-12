import { useContext, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { AuthContext } from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import { changePassword } from "../../services/authService";
import { toast } from "react-toastify";

function ChangePasswordContent() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!formData.newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      toast.error(
        "New password must contain at least 8 characters, including uppercase, lowercase, number, and special character (@$!%*?&)",
      );
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setLoading(true);

    try {
      const response = await changePassword(
        formData.currentPassword,
        formData.newPassword,
      );
      toast.success("Password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      router.push("/account/profile");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change password");
      console.error("Change password error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Change Password - eCommerce Store</title>
      </Head>

      <div className="max-w-md mx-auto mt-8 px-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-linear-to-r from-blue-500 to-blue-600 px-6 py-8 text-white rounded-t-lg">
            <h1 className="text-3xl font-bold">Change Password</h1>
            <p className="text-blue-100 mt-2">Update your account security</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Current Password */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block mb-2 font-bold text-gray-700"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your current password"
                  required
                  className="w-full input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      current: !prev.current,
                    }))
                  }
                  className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                  title={
                    showPasswords.current ? "Hide password" : "Show password"
                  }
                >
                  {showPasswords.current ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block mb-2 font-bold text-gray-700"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your new password"
                  required
                  className="w-full input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      new: !prev.new,
                    }))
                  }
                  className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                  title={showPasswords.new ? "Hide password" : "Show password"}
                >
                  {showPasswords.new ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              {/* Password Strength */}
              {formData.newPassword && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      Password Strength:
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        getPasswordStrength(formData.newPassword) >= 5
                          ? "bg-green-100 text-green-800"
                          : getPasswordStrength(formData.newPassword) >= 3
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {getPasswordStrength(formData.newPassword) >= 5
                        ? "Strong"
                        : getPasswordStrength(formData.newPassword) >= 3
                          ? "Moderate"
                          : "Weak"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        getPasswordStrength(formData.newPassword) >= 5
                          ? "bg-green-500"
                          : getPasswordStrength(formData.newPassword) >= 3
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{
                        width: `${(getPasswordStrength(formData.newPassword) / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              {formData.newPassword &&
                !validatePassword(formData.newPassword) && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    <p className="font-bold mb-2">✗ Password must contain:</p>
                    <ul className="space-y-1">
                      {formData.newPassword.length < 8 && (
                        <li>• At least 8 characters</li>
                      )}
                      {!/[A-Z]/.test(formData.newPassword) && (
                        <li>• At least one uppercase letter</li>
                      )}
                      {!/[a-z]/.test(formData.newPassword) && (
                        <li>• At least one lowercase letter</li>
                      )}
                      {!/\d/.test(formData.newPassword) && (
                        <li>• At least one number</li>
                      )}
                      {!/[@$!%*?&]/.test(formData.newPassword) && (
                        <li>• At least one special character (@$!%*?&)</li>
                      )}
                    </ul>
                  </div>
                )}

              {formData.newPassword &&
                validatePassword(formData.newPassword) && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    ✓ Password meets all requirements
                  </div>
                )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block mb-2 font-bold text-gray-700"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter your new password"
                  required
                  className="w-full input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      confirm: !prev.confirm,
                    }))
                  }
                  className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                  title={
                    showPasswords.confirm ? "Hide password" : "Show password"
                  }
                >
                  {showPasswords.confirm ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              {formData.confirmPassword &&
                formData.newPassword !== formData.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">
                    ✗ Passwords do not match
                  </p>
                )}

              {formData.confirmPassword &&
                formData.newPassword === formData.confirmPassword && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ Passwords match
                  </p>
                )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
              <Link href="/account/profile" className="btn-secondary flex-1">
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Link
            href="/"
            className="text-blue-600 hover:underline font-semibold"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <ChangePasswordContent />
    </ProtectedRoute>
  );
}
