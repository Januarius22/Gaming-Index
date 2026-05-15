import PublicFooter from "@/components/public/PublicFooter";
import PublicNavbar from "@/components/public/PublicNavbar";

export default function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1 overflow-x-clip">{children}</main>
      <PublicFooter />
    </div>
  );
}
