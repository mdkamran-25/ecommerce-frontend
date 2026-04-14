/**
 * Profile Redirect Page
 * Redirects /profile to /account/profile for consistency
 */

import { useEffect, JSX } from "react";
import { useRouter } from "next/router";

/**
 * ProfileRedirect - Redirects to account/profile page
 */
const ProfileRedirect = (): JSX.Element => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/account/profile");
  }, [router]);

  return null;
};

export default ProfileRedirect;
