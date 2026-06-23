import IndustryLanding, { industryMeta } from "@/components/IndustryLanding";

export const metadata = industryMeta("law-firms");

export default function Page() {
  return <IndustryLanding slug="law-firms" />;
}
