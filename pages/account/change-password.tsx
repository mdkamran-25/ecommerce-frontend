import { useContext, useState, JSX } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { AuthContext } from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import { changePassword } from "../../services/authService";
import { toast } from "react-toastify";

/**
 * ChangePasswordPage
 * User password change page
 */

interface User {
  id: string;
  firstName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
}

interface PasswordVisibility {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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

/**
 * ChangePasswordContent Component
 * Inner component for password change (used with ProtectedRoute wrapper)
 */
function ChangePasswordContent(): JSX.Element {
  const router = useRouter();
  const { user } = useContext(AuthContext) as AuthContextType;
  const [loading, setLoading] = useState<boolean>(false);
  const [showPasswords, setShowPasswords] = useState<PasswordVisibility>({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState<FormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
   * Handle input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle password change submission
   */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
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
      await changePassword(formData.currentPassword, formData.newPassword);
      toast.success("Password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      router.push("/account/profile");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to change password");
      console.error("Change password error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="loading">Redirecting...</div>;
  }

  const newPasswordStrength = getPasswordStrength(formData.newPassword);
  const strengthInfo = getPasswordStrengthInfo(newPasswordStrength);

  return (
    <>
      <Head>
        <title>Change Password - eCommerce Store</title>
      </Head>

      <div className="max-w-md mx-auto mt-8 px-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div
            className="px-6 py-8 text-white rounded-t-lg"
            style={{
              backgroundImage: "linear-gradient(to right, #3b82f6, #2563eb)",
            }}
          >
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
                        width: `${(newPasswordStrength / 5) * 100}%`,
                        backgroundColor: strengthInfo.color,
                        transition: "width 0.3s ease",
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block mb-2 font-bold text-gray-700"
              >
                Confirm Password
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

              {formData.newPassword &&
                formData.confirmPassword &&
                (formData.newPassword === formData.confirmPassword ? (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Passwords match
                  </p>
                ) : (
                  <p className="text-xs text-red-600 mt-2">
                    ✗ Passwords do not match
                  </p>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
              <Link
                href="/account/profile"
                className="px-4 py-2 text-sm font-bold text-gray-700 transition bg-gray-200 rounded hover:bg-gray-300"
              >
                Back to Profile
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

/**
 * Change Password Page with Protected Route
 */
const ChangePasswordPage = (): JSX.Element => {
  return (
    <ProtectedRoute>
      <ChangePasswordContent />
    </ProtectedRoute>
  );
};

export default ChangePasswordPage;
