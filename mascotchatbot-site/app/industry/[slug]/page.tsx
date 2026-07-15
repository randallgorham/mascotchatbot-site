import { notFound } from "next/navigation";
import IndustryLanding from "@/components/IndustryLanding";
import { INDUSTRIES, industryMeta } from "@/lib/industries";

export function generateStaticParams() {
  return Object.keys(INDUSTRIES).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  return industryMeta(params.slug);
}

export default function Page({ params }: { params: { slug: string } }) {
  if (!INDUSTRIES[params.slug]) notFound();
  return <IndustryLanding slug={params.slug} />;
}
