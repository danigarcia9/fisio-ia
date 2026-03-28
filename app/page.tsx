import { redirect } from "next/navigation";

/**
 * Root page — redirects to /session (main app) or /setup if no profile exists.
 * In Phase 0, we always redirect to /session. Profile check is done client-side.
 */
export default function Home() {
  redirect("/session");
}
