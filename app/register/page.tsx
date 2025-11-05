import { redirect } from "next/navigation";

/**
 * /register route - redirects to /auth/signup
 * This provides a shorter alias for the signup page
 */
export default function RegisterPage() {
  redirect("/auth/signup");
}

