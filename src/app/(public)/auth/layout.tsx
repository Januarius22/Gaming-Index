import AuthFormShell from "@/components/auth/AuthFormShell";

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthFormShell>{children}</AuthFormShell>;
}
