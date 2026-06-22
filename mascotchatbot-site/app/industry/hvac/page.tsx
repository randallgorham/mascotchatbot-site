import IndustryLanding, { industryMeta } from "@/components/IndustryLanding";

export const metadata = industryMeta("hvac");

export default function Page() {
  return <IndustryLanding slug="hvac" />;
}
