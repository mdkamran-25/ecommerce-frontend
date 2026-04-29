import { useContext, useEffect, useState, JSX } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { AuthContext } from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import { updateProfile } from "../../services/authService";
import { toast } from "react-toastify";

/**
 * ProfilePage
 * User profile management page
 */

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
}

interface FormDataType {
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * ProfilePageContent Component
 * Inner component for profile content (used with ProtectedRoute wrapper)
 */
function ProfilePageContent(): JSX.Element {
  const router = useRouter();
  const { user } = useContext(AuthContext) as AuthContextType;
  const [editMode, setEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormDataType>({
    firstName: "",
    lastName: "",
    email: "",
  });

  /**
   * Initialize form data when user is loaded
   */
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

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
   * Handle profile update
   */
  const handleUpdateProfile = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    if (!formData.lastName.trim()) {
      toast.error("Last name is required");
      return;
    }

    setLoading(true);

    try {
      await updateProfile(formData.firstName, formData.lastName);
      toast.success("Profile updated successfully!");
      setEditMode(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update profile");
      console.error("Update profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="loading">Redirecting...</div>;
  }

  return (
    <>
      <Head>
        <title>My Profile - eCommerce Store</title>
      </Head>

      <div className="max-w-2xl px-4 mx-auto mt-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Header */}
          <div
            className="px-6 py-8 text-white rounded-t-lg"
            style={{
              backgroundImage: "linear-gradient(to right, #3b82f6, #2563eb)",
            }}
          >
            <h1 className="mb-2 text-3xl font-bold">My Profile</h1>
            <p className="text-blue-100">Manage your account information</p>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {/* Verification Status */}
            <div
              className="p-4 mb-8 border rounded-lg"
              style={{
                borderColor: "#bfdbfe",
                backgroundColor: "#eff6ff",
              }}
            >
              <div className="flex items-center gap-3">
                {user.isVerified ? (
                  <>
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-bold text-gray-900">Email Verified</p>
                      <p className="text-sm text-gray-600">
                        Your email address has been verified
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">⏳</span>
                    <div>
                      <p className="font-bold text-gray-900">
                        Email Verification Pending
                      </p>
                      <p className="text-sm text-gray-600">
                        Please check your email to verify your account
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full input-field ${
                      !editMode ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    placeholder="Your first name"
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
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full input-field ${
                      !editMode ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-gray-100 cursor-not-allowed input-field"
                  placeholder="your@email.com"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Email cannot be changed. Please contact support if you need to
                  change your email.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-6 border-t border-gray-200 sm:flex-row">
                {!editMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditMode(true)}
                      className="btn-primary"
                    >
                      Edit Profile
                    </button>
                    <Link
                      href="/account/change-password"
                      className="px-4 py-2 text-sm font-bold text-gray-700 transition bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Change Password
                    </Link>
                    <Link
                      href="/wishlist"
                      className="px-4 py-2 text-sm font-bold text-white transition bg-black rounded hover:bg-gray-800"
                    >
                      My Wishlist
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 text-sm font-bold text-gray-700 transition bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Profile Page with Protected Route
 */
const ProfilePage = (): JSX.Element => {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
};

export default ProfilePage;
