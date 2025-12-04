import { redirect } from "next/navigation";

export default function SignUpPage() {
  // With magic link auth, sign-up and sign-in are the same flow
  redirect("/sign-in");
}
