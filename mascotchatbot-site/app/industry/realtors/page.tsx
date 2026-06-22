import IndustryLanding, { industryMeta } from "@/components/IndustryLanding";

export const metadata = industryMeta("realtors");

export default function Page() {
  return <IndustryLanding slug="realtors" />;
}
