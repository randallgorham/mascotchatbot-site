import IndustryLanding, { industryMeta } from "@/components/IndustryLanding";

export const metadata = industryMeta("dentists");

export default function Page() {
  return <IndustryLanding slug="dentists" />;
}
