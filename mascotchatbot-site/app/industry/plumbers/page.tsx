import IndustryLanding, { industryMeta } from "@/components/IndustryLanding";

export const metadata = industryMeta("plumbers");

export default function Page() {
  return <IndustryLanding slug="plumbers" />;
}
