import type { Metadata } from "next";

export type Ind = {
  slug: string; label: string; role: string; img: string; name: string;
  headline: string; sub: string; pains: { t: string; d: string }[];
};

export const INDUSTRIES: Record<string, Ind> = {
  electricians: {
    slug: "electricians", label: "Electricians", role: "electrical company", img: "dr-volt-1.png", name: "Dr. Volt",
    headline: "Your electrical company, talking.",
    sub: "A friendly mascot that answers wiring questions, calms emergencies, and books service calls — 24/7, even after hours.",
    pains: [
      { t: "Catch after-hours emergencies", d: "Sparking outlet at 9pm? Your mascot triages it and books the call instead of sending them to a competitor." },
      { t: "Answer the same questions", d: "Panel upgrades, EV chargers, pricing ranges — answered instantly so your phone rings less." },
      { t: "Book jobs while you're on a ladder", d: "Every visitor gets greeted and guided onto your calendar without you lifting a finger." },
    ],
  },
  hvac: {
    slug: "hvac", label: "HVAC", role: "HVAC company", img: "hvac.png", name: "Reggie",
    headline: "Your HVAC business, talking.",
    sub: "A mascot that handles no-heat and no-cool calls, explains maintenance plans, and books service the moment a visitor lands.",
    pains: [
      { t: "Never miss a no-heat call", d: "Peak season floods your phone. Your mascot captures and books every after-hours emergency." },
      { t: "Sell maintenance plans", d: "It explains tune-ups and memberships in plain English and nudges visitors to sign up." },
      { t: "Fill the schedule", d: "Turns website traffic into booked installs and service calls around the clock." },
    ],
  },
  plumbers: {
    slug: "plumbers", label: "Plumbers", role: "plumbing company", img: "06-plumber-home-services-male.jpg", name: "Max",
    headline: "Your plumbing business, talking.",
    sub: "A mascot that calms leaks-and-floods panic, gives quick guidance, and books the truck — day or night.",
    pains: [
      { t: "Capture emergency leaks", d: "Burst pipe at midnight? Your mascot books it before they call the next plumber on Google." },
      { t: "Pre-qualify the job", d: "It gathers what's wrong and where, so you roll up prepared." },
      { t: "Stop missed calls", d: "Every visitor is greeted and guided onto your schedule, even when you're under a sink." },
    ],
  },
  dentists: {
    slug: "dentists", label: "Dentists", role: "dental practice", img: "04-dentist-male.jpg", name: "Dr. Bright",
    headline: "Your dental practice, talking.",
    sub: "A warm mascot that answers insurance and new-patient questions and books cleanings while your front desk is busy.",
    pains: [
      { t: "Book new patients 24/7", d: "Most people search for a dentist after hours — your mascot turns them into appointments." },
      { t: "Answer insurance questions", d: "Plans accepted, new-patient specials, what to expect — handled instantly." },
      { t: "Reduce front-desk load", d: "Routine questions get answered automatically so your team focuses on patients." },
    ],
  },
  realtors: {
    slug: "realtors", label: "Realtors", role: "real estate agent", img: "01-realtor-female-classic.jpg", name: "Ava",
    headline: "Your real estate brand, talking.",
    sub: "A mascot that engages buyers and sellers, answers listing questions, and books showings and valuations instantly.",
    pains: [
      { t: "Capture every lead", d: "Buyers browse late at night — your mascot greets them and books the showing." },
      { t: "Qualify buyers and sellers", d: "It gathers budget, timeline, and area, then routes hot leads to you." },
      { t: "Book valuations", d: "Turns 'what's my home worth?' visitors into booked listing appointments." },
    ],
  },
  "med-spas": {
    slug: "med-spas", label: "Med-spas", role: "med-spa", img: "15-medspa-female.jpg", name: "Skye",
    headline: "Your med-spa, talking.",
    sub: "An on-brand mascot that explains treatments, answers pricing, and books consultations around the clock.",
    pains: [
      { t: "Book consultations 24/7", d: "Botox, fillers, facials — your mascot guides interest into booked appointments." },
      { t: "Answer treatment questions", d: "Downtime, pricing ranges, packages — answered instantly and on-brand." },
      { t: "Fill slow days", d: "Promote specials and memberships to every visitor automatically." },
    ],
  },
  "law-firms": {
    slug: "law-firms", label: "Law firms", role: "law firm", img: "20-attorney-male.jpg", name: "Vance",
    headline: "Your law firm, talking.",
    sub: "A professional mascot that screens cases, answers common questions, and books consultations 24/7.",
    pains: [
      { t: "Capture cases after hours", d: "People search for a lawyer in a crisis — your mascot books the consult immediately." },
      { t: "Pre-screen matters", d: "It gathers case type and details so you only spend time on the right clients." },
      { t: "Never miss an inquiry", d: "Every visitor is greeted and guided to schedule, even mid-trial." },
    ],
  },
  gyms: {
    slug: "gyms", label: "Gyms", role: "gym", img: "18-gym-instructor-female-blonde.jpg", name: "Brooke",
    headline: "Your gym, talking.",
    sub: "An energetic mascot that answers membership questions, books tours, and signs up new members 24/7.",
    pains: [
      { t: "Sign up members 24/7", d: "New Year's resolutions don't wait for business hours — your mascot books the tour." },
      { t: "Answer membership questions", d: "Plans, classes, hours, day passes — handled instantly." },
      { t: "Book tours and trials", d: "Turns curious visitors into booked walk-throughs and free trials." },
    ],
  },
  salons: {
    slug: "salons", label: "Salons", role: "salon", img: "hair.png", name: "Gigi",
    headline: "Your salon, talking.",
    sub: "A stylish mascot that answers service and pricing questions and books appointments while you're behind the chair.",
    pains: [
      { t: "Book while you style", d: "You can't answer the phone mid-color — your mascot books the next client for you." },
      { t: "Answer service questions", d: "Pricing, stylists, availability — answered instantly, on-brand." },
      { t: "Fill the chair", d: "Turns every website visit into a booked cut, color, or treatment." },
    ],
  },
  veterinary: {
    slug: "veterinary", label: "Veterinary clinics", role: "veterinary clinic", img: "vet.png", name: "Bella",
    headline: "Your vet clinic, talking.",
    sub: "A caring mascot that calms worried pet parents, answers questions, and books visits 24/7.",
    pains: [
      { t: "Help worried pet parents", d: "After-hours concerns get a calm, helpful answer and a booked appointment." },
      { t: "Answer the basics", d: "Hours, services, new-patient info, what to bring — handled instantly." },
      { t: "Fill the schedule", d: "Turns anxious late-night searches into booked wellness and sick visits." },
    ],
  },
  barbershops: {
    slug: "barbershops", label: "Barbershops", role: "barbershop", img: "barber.png", name: "Theo",
    headline: "Your barbershop, talking.",
    sub: "A sharp mascot that answers questions, fills the chair, and books cuts and fades around the clock.",
    pains: [
      { t: "Book cuts 24/7", d: "Clients decide on a fresh cut at all hours — your mascot books them before they scroll past." },
      { t: "Answer the basics", d: "Walk-ins, pricing, barbers, and hours — handled instantly so your phone stays quiet." },
      { t: "Cut down no-shows", d: "It confirms appointments and fills last-minute openings automatically." },
    ],
  },
  restaurants: {
    slug: "restaurants", label: "Restaurants", role: "restaurant", img: "chef.png", name: "Marco",
    headline: "Your restaurant, talking.",
    sub: "A friendly mascot that answers menu and hours questions, takes reservations, and handles catering inquiries 24/7.",
    pains: [
      { t: "Take reservations anytime", d: "Diners book a table after hours — your mascot captures it instead of losing them to the next spot." },
      { t: "Answer menu & hours", d: "Dietary options, hours, location, specials — answered instantly so your staff can focus on service." },
      { t: "Catch catering leads", d: "It qualifies private-event and catering requests and routes them straight to you." },
    ],
  },
  florists: {
    slug: "florists", label: "Florists", role: "flower shop", img: "florist.png", name: "Rosie",
    headline: "Your flower shop, talking.",
    sub: "A cheerful mascot that helps shoppers pick arrangements, answers delivery questions, and books orders 24/7.",
    pains: [
      { t: "Capture last-minute orders", d: "Anniversaries and apologies don't wait — your mascot books the order before the moment passes." },
      { t: "Answer delivery questions", d: "Same-day cutoffs, areas served, and pricing — handled instantly." },
      { t: "Upsell occasions", d: "It suggests add-ons and seasonal arrangements to every visitor automatically." },
    ],
  },
  landscapers: {
    slug: "landscapers", label: "Landscapers", role: "landscaping company", img: "landscaper.png", name: "Sage",
    headline: "Your landscaping business, talking.",
    sub: "A hard-working mascot that answers service questions, qualifies jobs, and books estimates around the clock.",
    pains: [
      { t: "Book estimates 24/7", d: "Homeowners plan projects on weekends — your mascot books the estimate while you're on the mower." },
      { t: "Qualify the job", d: "It gathers property size, services needed, and timeline so you quote faster." },
      { t: "Fill the route", d: "Turns website visits into booked maintenance and install jobs all season long." },
    ],
  },
  massage: {
    slug: "massage", label: "Massage therapy", role: "massage studio", img: "massage.png", name: "Mia",
    headline: "Your massage studio, talking.",
    sub: "A calming mascot that answers questions, explains services, and books sessions while you're in the treatment room.",
    pains: [
      { t: "Book while you work", d: "You can't answer the phone mid-session — your mascot books the next client for you." },
      { t: "Answer service questions", d: "Modalities, pricing, durations, and intake — handled instantly and on-brand." },
      { t: "Fill open slots", d: "It promotes packages and last-minute openings to every visitor." },
    ],
  },
  "nail-salons": {
    slug: "nail-salons", label: "Nail salons", role: "nail salon", img: "nail.png", name: "Lily",
    headline: "Your nail salon, talking.",
    sub: "A stylish mascot that answers service and pricing questions and books manis and pedis 24/7.",
    pains: [
      { t: "Book appointments anytime", d: "Clients plan their self-care after hours — your mascot books them on the spot." },
      { t: "Answer service questions", d: "Gel, acrylics, pricing, and availability — answered instantly." },
      { t: "Fill the chairs", d: "Turns every visit into a booked mani, pedi, or full set." },
    ],
  },
  "tattoo-studios": {
    slug: "tattoo-studios", label: "Tattoo studios", role: "tattoo studio", img: "tattoo.png", name: "Rae",
    headline: "Your tattoo studio, talking.",
    sub: "An on-brand mascot that answers questions, screens ideas, and books consultations and deposits 24/7.",
    pains: [
      { t: "Capture booking requests", d: "Inspiration strikes at midnight — your mascot books the consult before it fades." },
      { t: "Screen the idea", d: "It gathers placement, size, style, and budget so artists come prepared." },
      { t: "Reduce back-and-forth", d: "Pricing, aftercare, and artist availability — answered instantly." },
    ],
  },
  therapists: {
    slug: "therapists", label: "Therapists", role: "therapy practice", img: "therapist.png", name: "Nora",
    headline: "Your therapy practice, talking.",
    sub: "A warm, discreet mascot that answers questions, explains your approach, and books intro calls 24/7.",
    pains: [
      { t: "Book new clients 24/7", d: "People reach out when they're ready — your mascot books the intro call before hesitation sets in." },
      { t: "Answer the essentials", d: "Specialties, insurance, telehealth, and availability — handled gently and instantly." },
      { t: "Protect your time", d: "It screens fit and routes the right clients to your calendar." },
    ],
  },
};

export function industryMeta(slug: string): Metadata {
  const ind = INDUSTRIES[slug];
  if (!ind) return { title: "Industry" };
  const title = `AI Mascot Chatbot for ${ind.label} — ${ind.headline}`;
  return {
    title, description: ind.sub,
    alternates: { canonical: `/industry/${ind.slug}` },
    openGraph: { title, description: ind.sub, url: `https://mascotchatbot.com/industry/${ind.slug}`, images: ["/og.png"] },
  };
}
