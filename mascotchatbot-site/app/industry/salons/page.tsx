import IndustryLanding, { industryMeta } from "@/components/IndustryLanding";

export const metadata = industryMeta("salons");

export default function Page() {
  return <IndustryLanding slug="salons" />;
}
