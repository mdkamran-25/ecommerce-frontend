import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { AuthContext } from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import { updateProfile } from "../../services/authService";
import { toast } from "react-toastify";

function ProfilePageContent() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
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
      const response = await updateProfile(
        formData.firstName,
        formData.lastName,
      );
      toast.success("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update profile");
      console.error("Update profile error:", error);
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
        <title>My Profile - eCommerce Store</title>
      </Head>

      <div className="max-w-2xl px-4 mx-auto mt-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-8 text-white rounded-t-lg bg-linear-to-r from-blue-500 to-blue-600">
            <h1 className="mb-2 text-3xl font-bold">My Profile</h1>
            <p className="text-blue-100">Manage your account information</p>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {/* Verification Status */}
            <div className="p-4 mb-8 border border-blue-200 rounded-lg bg-blue-50">
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
                  onChange={handleInputChange}
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
              <div className="flex gap-3 pt-6 border-t border-gray-200">
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
                      className="btn-secondary"
                    >
                      Change Password
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
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </form>

            {/* Account Options */}
            <div className="pt-8 mt-8 border-t border-gray-200">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Account Options
              </h2>
              <div className="space-y-3">
                <Link
                  href="/orders"
                  className="block p-4 transition border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <p className="font-bold text-gray-900">View Order History</p>
                  <p className="text-sm text-gray-600">
                    See all your past orders
                  </p>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to deactivate your account? This action cannot be undone.",
                      )
                    ) {
                      toast.info("Account deactivation coming soon");
                    }
                  }}
                  className="w-full p-4 text-left transition border border-red-200 rounded-lg hover:bg-red-50"
                >
                  <p className="font-bold text-red-600">Deactivate Account</p>
                  <p className="text-sm text-gray-600">
                    Permanently delete your account
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Link
            href="/"
            className="font-semibold text-blue-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
