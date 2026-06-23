import IndustryLanding, { industryMeta } from "@/components/IndustryLanding";

export const metadata = industryMeta("gyms");

export default function Page() {
  return <IndustryLanding slug="gyms" />;
}
