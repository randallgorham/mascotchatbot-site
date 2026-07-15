import Link from "next/link";
import GalleryBrowser from "@/components/GalleryBrowser";

export const metadata = {
  title: "Mascot Gallery — 150+ ready-made characters | MascotChatbot",
  description: "Browse our full library of ready-made animated mascot characters — a friendly face for every trade and industry.",
};

type Mascot = { img: string; niche: string };

const MASCOTS: Mascot[] = [
  { img: "01-realtor-female", niche: "Realtor" },
  { img: "02-realtor-glam", niche: "Realtor Glam" },
  { img: "03-realtor-male", niche: "Realtor" },
  { img: "04-dentist", niche: "Dentist" },
  { img: "05-fitness-coach-male", niche: "Fitness Coach" },
  { img: "06-plumber", niche: "Plumber" },
  { img: "07-electrician-male-hardhat", niche: "Electrician" },
  { img: "08-electrician-male", niche: "Electrician" },
  { img: "09-contractor-male-cap-vest", niche: "Contractor" },
  { img: "10-doctor-male", niche: "Doctor" },
  { img: "11-general-contractor-male", niche: "General Contractor" },
  { img: "12-dentist-female", niche: "Dentist" },
  { img: "13-doctor-female", niche: "Doctor" },
  { img: "14-fitness-coach-female", niche: "Fitness Coach" },
  { img: "15-medspa", niche: "Medspa" },
  { img: "16-nurse-female", niche: "Nurse" },
  { img: "17-nurse-female-v2", niche: "Nurse" },
  { img: "18-gym", niche: "Gym" },
  { img: "18-gym-alt", niche: "Gym" },
  { img: "19-mechanic-male", niche: "Mechanic" },
  { img: "20-attorney", niche: "Attorney" },
  { img: "21-tattoo-artist-male", niche: "Tattoo Artist" },
  { img: "22-massage-therapist-female", niche: "Massage Therapist" },
  { img: "23-barber-male", niche: "Barber" },
  { img: "24-florist-female", niche: "Florist" },
  { img: "25-veterinarian-female", niche: "Veterinarian" },
  { img: "26-hvac", niche: "Hvac" },
  { img: "26-hvac-alt", niche: "Hvac" },
  { img: "27-chef-male", niche: "Chef" },
  { img: "28-hair", niche: "Hair" },
  { img: "29-nail-technician-female", niche: "Nail Technician" },
  { img: "30-therapist-female", niche: "Therapist" },
  { img: "31-landscaper-male", niche: "Landscaper" },
  { img: "32-roofer", niche: "Roofer" },
  { img: "33-framer", niche: "Framer" },
  { img: "34-mason", niche: "Mason" },
  { img: "35-concrete-finisher", niche: "Concrete Finisher" },
  { img: "36-painter", niche: "Painter" },
  { img: "37-drywall", niche: "Drywall" },
  { img: "38-welder", niche: "Welder" },
  { img: "39-heavy-equipment-operator", niche: "Heavy Equipment Operator" },
  { img: "40-flooring", niche: "Flooring" },
  { img: "41-fencing", niche: "Fencing" },
  { img: "42-garage-door", niche: "Garage Door" },
  { img: "43-solar-installer", niche: "Solar Installer" },
  { img: "44-pool-service", niche: "Pool Service" },
  { img: "45-insulation", niche: "Insulation" },
  { img: "46-tile-setter", niche: "Tile Setter" },
  { img: "47-glazier", niche: "Glazier" },
  { img: "48-ironworker", niche: "Ironworker" },
  { img: "49-sheet-metal", niche: "Sheet Metal" },
  { img: "50-demolition", niche: "Demolition" },
  { img: "51-arborist-tree-service", niche: "Arborist Tree Service" },
  { img: "52-pest-control", niche: "Pest Control" },
  { img: "53-locksmith", niche: "Locksmith" },
  { img: "54-appliance-repair", niche: "Appliance Repair" },
  { img: "55-handyman", niche: "Handyman" },
  { img: "56-cleaning-maid-female", niche: "Cleaning Maid" },
  { img: "57-junk-removal", niche: "Junk Removal" },
  { img: "58-pressure-washing", niche: "Pressure Washing" },
  { img: "59-window-cleaner", niche: "Window Cleaner" },
  { img: "60-gutter-cleaning", niche: "Gutter Cleaning" },
  { img: "61-security-installer", niche: "Security Installer" },
  { img: "62-mover", niche: "Mover" },
  { img: "63-auto-detailer", niche: "Auto Detailer" },
  { img: "64-home-inspector", niche: "Home Inspector" },
  { img: "65-countertop-cabinet", niche: "Countertop Cabinet" },
  { img: "66-snow-removal", niche: "Snow Removal" },
  { img: "68-septic-service", niche: "Septic Service" },
  { img: "69-foundation-waterproofing", niche: "Foundation Waterproofing" },
  { img: "70-deck-builder-female", niche: "Deck Builder" },
  { img: "71-epoxy-floor-coating", niche: "Epoxy Floor Coating" },
  { img: "73-carpet-cleaner", niche: "Carpet Cleaner" },
  { img: "78-mobile-mechanic-female", niche: "Mobile Mechanic" },
  { img: "79-sign-installer", niche: "Sign Installer" },
  { img: "81-mortgage-broker", niche: "Mortgage Broker" },
  { img: "82-accountant-cpa", niche: "Accountant Cpa" },
  { img: "84-photographer-male", niche: "Photographer" },
  { img: "85-photographer-female", niche: "Photographer" },
  { img: "86-esthetician", niche: "Esthetician" },
  { img: "87-lash-tech", niche: "Lash Tech" },
  { img: "88-brow-artist", niche: "Brow Artist" },
  { img: "89-makeup-artist", niche: "Makeup Artist" },
  { img: "90-spray-tan-tech", niche: "Spray Tan Tech" },
  { img: "91-waxing-specialist", niche: "Waxing Specialist" },
  { img: "92-permanent-makeup-artist", niche: "Permanent Makeup Artist" },
  { img: "93-spa-attendant", niche: "Spa Attendant" },
  { img: "95-dog-groomer", niche: "Dog Groomer" },
  { img: "96-dog-trainer", niche: "Dog Trainer" },
  { img: "97-pet-sitter-dog-walker", niche: "Pet Sitter Dog Walker" },
  { img: "98-pet-boarding", niche: "Pet Boarding" },
  { img: "99-mobile-groomer", niche: "Mobile Groomer" },
  { img: "100-auto-body-tech", niche: "Auto Body Tech" },
  { img: "101-tire-tech", niche: "Tire Tech" },
  { img: "102-oil-change-tech", niche: "Oil Change Tech" },
  { img: "103-car-wash-attendant", niche: "Car Wash Attendant" },
  { img: "104-tow-truck-operator", niche: "Tow Truck Operator" },
  { img: "106-optometrist", niche: "Optometrist" },
  { img: "107-orthodontist", niche: "Orthodontist" },
  { img: "108-dermatologist", niche: "Dermatologist" },
  { img: "109-pediatrician", niche: "Pediatrician" },
  { img: "110-physical-therapist", niche: "Physical Therapist" },
  { img: "111-dietitian", niche: "Dietitian" },
  { img: "112-pharmacist", niche: "Pharmacist" },
  { img: "113-audiologist", niche: "Audiologist" },
  { img: "114-podiatrist", niche: "Podiatrist" },
  { img: "115-home-caregiver", niche: "Home Caregiver" },
  { img: "119-personal-trainer", niche: "Personal Trainer" },
  { img: "122-barista-male", niche: "Barista" },
  { img: "123-food-truck-cook", niche: "Food Truck Cook" },
  { img: "124-caterer-female", niche: "Caterer" },
  { img: "125-bartender-male", niche: "Bartender" },
  { img: "125-bartender-female", niche: "Bartender" },
  { img: "125-bartender-female-edgy", niche: "Bartender" },
  { img: "126-butcher", niche: "Butcher" },
  { img: "127-brewer", niche: "Brewer" },
  { img: "128-financial-advisor", niche: "Financial Advisor" },
  { img: "129-bookkeeper", niche: "Bookkeeper" },
  { img: "130-notary", niche: "Notary" },
  { img: "131-it-technician", niche: "IT Technician" },
  { img: "132-marketing-creative", niche: "Marketing Creative" },
  { img: "133-recruiter", niche: "Recruiter" },
  { img: "134-business-consultant", niche: "Business Consultant" },
  { img: "135-web-designer", niche: "Web Designer" },
  { img: "136-property-manager-female", niche: "Property Manager" },
  { img: "137-appraiser", niche: "Appraiser" },
  { img: "139-escrow-officer", niche: "Escrow Officer" },
  { img: "141-event-planner-female", niche: "Event Planner" },
  { img: "142-dj", niche: "Dj" },
  { img: "143-videographer", niche: "Videographer" },
  { img: "144-party-rental-female", niche: "Party Rental" },
  { img: "145-graphic-designer", niche: "Graphic Designer" },
  { img: "146-preschool-teacher", niche: "Preschool Teacher" },
  { img: "147-tutor", niche: "Tutor" },
  { img: "148-driving-instructor", niche: "Driving Instructor" },
  { img: "151-smart-home-installer", niche: "Smart Home Installer" },
  { img: "151-smart-home-installer-white", niche: "Smart Home Installer White" },
  { img: "152-ev-charger-installer", niche: "EV Charger Installer" },
  { img: "154-low-voltage-tech", niche: "Low Voltage Tech" },
  { img: "155-holiday-lighting", niche: "Holiday Lighting" },
  { img: "156-turf-installer", niche: "Turf Installer" },
  { img: "158-dry-cleaner", niche: "Dry Cleaner" },
  { img: "159-tailor-seamstress", niche: "Tailor Seamstress" },
  { img: "160-jeweler", niche: "Jeweler" },
  { img: "161-travel-agent-female", niche: "Travel Agent" },
  { img: "162-funeral-director", niche: "Funeral Director" },
  { img: "163-courier-delivery", niche: "Courier Delivery" },
  { img: "164-realtor-female-bubbly", niche: "Realtor Bubbly" },
  { img: "165-house-cleaner-female", niche: "House Cleaner" },
  { img: "166-insurance-agent-female", niche: "Insurance Agent" },
  { img: "167-dentist-female", niche: "Dentist" },
  { img: "168-hair-stylist-female", niche: "Hair Stylist" },
  { img: "169-nail-tech-female", niche: "Nail Tech" },
  { img: "170-fitness-coach-female", niche: "Fitness Coach" },
  { img: "171-medspa-esthetician", niche: "Medspa Esthetician" },
  { img: "172-barista", niche: "Barista" },
  { img: "173-dog-groomer-female", niche: "Dog Groomer" },
  { img: "174-baker-female", niche: "Baker" },
  { img: "175-attorney-female", niche: "Attorney" },
  { img: "176-veterinarian-female", niche: "Veterinarian" },
  { img: "192-chiropractor", niche: "Chiropractor" },
  { img: "193-chimney-sweep", niche: "Chimney Sweep" },
  { img: "194-interior-designer", niche: "Interior Designer" },
  { img: "195-music-teacher", niche: "Music Teacher" },
  { img: "196-dance-instructor", niche: "Dance Instructor" },
  { img: "197-swim-instructor", niche: "Swim Instructor" },
  { img: "198-martial-arts-instructor", niche: "Martial Arts Instructor" },
  { img: "199-social-media-manager", niche: "Social Media Manager" },
  { img: "200-copywriter", niche: "Copywriter" },
  { img: "201-podcast-producer", niche: "Podcast Producer" },
  { img: "202-virtual-assistant", niche: "Virtual Assistant" },
  { img: "203-yoga-instructor", niche: "Yoga Instructor" },
  { img: "204-pilates-instructor", niche: "Pilates Instructor" },
  { img: "205-life-coach", niche: "Life Coach" },
  { img: "206-acupuncturist", niche: "Acupuncturist" },
  { img: "207-home-stager", niche: "Home Stager" },
  { img: "208-water-treatment-tech", niche: "Water Treatment Tech" },
  { img: "209-fireplace-specialist", niche: "Fireplace Specialist" },
  { img: "210-awning-installer", niche: "Awning Installer" },
];

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <Link href="/" className="text-2xl font-bold tracking-tightest">
            Mascot<span className="text-smoke">Chatbot</span>
          </Link>
          <Link href="/#pricing" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:-translate-y-0.5">
            Get your mascot →
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-3 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest">
            The full roster
          </p>
        </div>
        <h1 className="text-center text-4xl font-bold tracking-tightest md:text-6xl">
          {MASCOTS.length}+ ready-made mascots
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-smoke">
          A friendly face for every trade. Pick one you love or we&apos;ll design a custom character for your brand.
        </p>

        <GalleryBrowser mascots={MASCOTS} />

        <div className="mt-16 text-center">
          <Link href="/#pricing" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-7 py-3.5 text-base font-semibold text-paper transition hover:-translate-y-0.5">
            Get your mascot →
          </Link>
        </div>
      </section>
    </main>
  );
}
