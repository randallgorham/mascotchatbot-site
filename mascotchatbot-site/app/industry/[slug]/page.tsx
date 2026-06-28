import { notFound } from "next/navigation";
import IndustryLanding from "@/components/IndustryLanding";
import { INDUSTRIES, industryMeta } from "@/lib/industries";

const NEW_SLUGS = ["barbershops", "restaurants", "florists", "landscapers", "massage", "nail-salons", "tattoo-studios", "therapists"];

export function generateStaticParams() {
  return NEW_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  return industryMeta(params.slug);
}

export default function Page({ params }: { params: { slug: string } }) {
  if (!INDUSTRIES[params.slug]) notFound();
  return <IndustryLanding slug={params.slug} />;
}
