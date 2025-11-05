import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";

/**
 * /app route - redirects to dashboard for authenticated users
 * or to sign in for unauthenticated users
 */
export default async function AppPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.id) {
    redirect("/dashboard");
  } else {
    redirect("/auth/signin");
  }
}

