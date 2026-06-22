import IndustryLanding, { industryMeta } from "@/components/IndustryLanding";

export const metadata = industryMeta("electricians");

export default function Page() {
  return <IndustryLanding slug="electricians" />;
}
