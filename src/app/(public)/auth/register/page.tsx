import RegisterForm from "@/components/auth/RegisterForm";
import { redirectIfAuthenticated } from "@/lib/auth";

export default async function RegisterPage() {
  await redirectIfAuthenticated();

  return <RegisterForm />;
}
