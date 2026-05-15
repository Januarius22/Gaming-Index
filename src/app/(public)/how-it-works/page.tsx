import HowItWorks from "@/components/public/HowItWorks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const principles = [
  {
    title: "Public routes stay focused",
    description: "The landing experience uses its own layout so navigation never leaks into dashboards."
  },
  {
    title: "Account flow stays practical",
    description: "Users browse first, then unlock seller access later without needing a second account."
  },
  {
    title: "Admin flow stays controlled",
    description: "Admins review KYC, listings, orders, and disputes from a separate operational dashboard."
  }
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-4 pb-16">
      <HowItWorks
        title="The account journey in three focused steps"
        description="Everything is laid out so each segment has one job and one visual system."
        className="pb-10 pt-6"
      />

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {principles.map((principle) => (
            <Card key={principle.title}>
              <CardHeader>
                <CardTitle>{principle.title}</CardTitle>
                <CardDescription>{principle.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-1.5 w-16 rounded-full bg-primary" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
