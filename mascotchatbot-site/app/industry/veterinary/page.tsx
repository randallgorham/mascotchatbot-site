import IndustryLanding, { industryMeta } from "@/components/IndustryLanding";

export const metadata = industryMeta("veterinary");

export default function Page() {
  return <IndustryLanding slug="veterinary" />;
}
