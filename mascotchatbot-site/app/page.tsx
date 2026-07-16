import { HeroBot } from "@/components/BrandBot";
import LeadForm from "@/components/LeadForm";
import OpenMascot from "@/components/OpenMascot";
import MobileNav from "@/components/MobileNav";
import NavActions from "@/components/NavActions";
import Pricing from "@/components/Pricing";
import SiteFooter from "@/components/SiteFooter";
import { MascotMarquee, MascotRoster } from "@/components/MascotShowcase";
import { getSetting } from "@/lib/vault";

export const dynamic = "force-dynamic";

const TALK_CSS = `
@keyframes mcShine{0%{background-position:120% 0}100%{background-position:-120% 0}}
@keyframes mcEq{0%,100%{transform:scaleY(.22)}50%{transform:scaleY(1)}}
.mc-talk{background-image:linear-gradient(90deg,#0a0a0a 0%,#0a0a0a 42%,#2bc4e6 50%,#0a0a0a 58%,#0a0a0a 100%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:mcShine 2.6s linear infinite}
.mc-eq{display:inline-flex;align-items:flex-end;gap:.045em;height:.5em;margin-left:.16em;vertical-align:baseline}
.mc-eq i{width:.09em;min-width:3px;height:100%;background:#2bc4e6;border-radius:2px;transform-origin:bottom;animation:mcEq .9s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.mc-talk{animation:none;background:none;-webkit-text-fill-color:currentColor;color:inherit}.mc-eq i{animation:none}}
`;

const STEPS = [
  { n: "01", t: "We design the mascot", d: "Your character or one we create — rigged to move, blink, and talk fluidly." },
  { n: "02", t: "We give it a brain", d: "Trained on your business so it answers accurately, in your voice." },
  { n: "03", t: "We host it on your site", d: "One line of code. It captures leads and books jobs 24/7. You do nothing." },
];

// Full character roster shown in the gallery. Robo is the live, click-to-talk demo.
const CHARACTERS: { img: string; name: string; niche: string; say: string; ext?: string }[] = [
  { img: "01-realtor-female", name: "Realtor", niche: "Realtor", say: "Pick me!", ext: "png" },
  { img: "02-realtor-glam", name: "Realtor Glam", niche: "Realtor Glam", say: "Pick me!", ext: "png" },
  { img: "03-realtor-male", name: "Realtor", niche: "Realtor", say: "Pick me!", ext: "png" },
  { img: "04-dentist", name: "Dentist", niche: "Dentist", say: "Pick me!", ext: "png" },
  { img: "05-fitness-coach-male", name: "Fitness Coach", niche: "Fitness Coach", say: "Pick me!", ext: "png" },
  { img: "06-plumber", name: "Plumber", niche: "Plumber", say: "Pick me!", ext: "png" },
  { img: "07-electrician-male-hardhat", name: "Electrician", niche: "Electrician", say: "Pick me!", ext: "png" },
  { img: "08-electrician-male", name: "Electrician", niche: "Electrician", say: "Pick me!", ext: "png" },
  { img: "09-contractor-male-cap-vest", name: "Contractor", niche: "Contractor", say: "Pick me!", ext: "png" },
  { img: "10-doctor-male", name: "Doctor", niche: "Doctor", say: "Pick me!", ext: "png" },
  { img: "11-general-contractor-male", name: "General Contractor", niche: "General Contractor", say: "Pick me!", ext: "png" },
  { img: "12-dentist-female", name: "Dentist", niche: "Dentist", say: "Pick me!", ext: "png" },
  { img: "13-doctor-female", name: "Doctor", niche: "Doctor", say: "Pick me!", ext: "png" },
  { img: "14-fitness-coach-female", name: "Fitness Coach", niche: "Fitness Coach", say: "Pick me!", ext: "png" },
  { img: "15-medspa", name: "Medspa", niche: "Medspa", say: "Pick me!", ext: "png" },
  { img: "16-nurse-female", name: "Nurse", niche: "Nurse", say: "Pick me!", ext: "png" },
  { img: "17-nurse-female-v2", name: "Nurse", niche: "Nurse", say: "Pick me!", ext: "png" },
  { img: "18-gym", name: "Gym", niche: "Gym", say: "Pick me!", ext: "png" },
  { img: "18-gym-alt", name: "Gym", niche: "Gym", say: "Pick me!", ext: "png" },
  { img: "19-mechanic-male", name: "Mechanic", niche: "Mechanic", say: "Pick me!", ext: "png" },
  { img: "20-attorney", name: "Attorney", niche: "Attorney", say: "Pick me!", ext: "png" },
  { img: "21-tattoo-artist-male", name: "Tattoo Artist", niche: "Tattoo Artist", say: "Pick me!", ext: "png" },
  { img: "22-massage-therapist-female", name: "Massage Therapist", niche: "Massage Therapist", say: "Pick me!", ext: "png" },
  { img: "23-barber-male", name: "Barber", niche: "Barber", say: "Pick me!", ext: "png" },
  { img: "24-florist-female", name: "Florist", niche: "Florist", say: "Pick me!", ext: "png" },
  { img: "25-veterinarian-female", name: "Veterinarian", niche: "Veterinarian", say: "Pick me!", ext: "png" },
  { img: "26-hvac", name: "Hvac", niche: "Hvac", say: "Pick me!", ext: "png" },
  { img: "26-hvac-alt", name: "Hvac", niche: "Hvac", say: "Pick me!", ext: "png" },
  { img: "27-chef-male", name: "Chef", niche: "Chef", say: "Pick me!", ext: "png" },
  { img: "28-hair", name: "Hair", niche: "Hair", say: "Pick me!", ext: "png" },
  { img: "29-nail-technician-female", name: "Nail Technician", niche: "Nail Technician", say: "Pick me!", ext: "png" },
  { img: "30-therapist-female", name: "Therapist", niche: "Therapist", say: "Pick me!", ext: "png" },
  { img: "31-landscaper-male", name: "Landscaper", niche: "Landscaper", say: "Pick me!", ext: "png" },
  { img: "32-roofer", name: "Roofer", niche: "Roofer", say: "Pick me!", ext: "png" },
  { img: "33-framer", name: "Framer", niche: "Framer", say: "Pick me!", ext: "png" },
  { img: "34-mason", name: "Mason", niche: "Mason", say: "Pick me!", ext: "png" },
  { img: "35-concrete-finisher", name: "Concrete Finisher", niche: "Concrete Finisher", say: "Pick me!", ext: "png" },
  { img: "36-painter", name: "Painter", niche: "Painter", say: "Pick me!", ext: "png" },
  { img: "37-drywall", name: "Drywall", niche: "Drywall", say: "Pick me!", ext: "png" },
  { img: "38-welder", name: "Welder", niche: "Welder", say: "Pick me!", ext: "png" },
  { img: "39-heavy-equipment-operator", name: "Heavy Equipment Operator", niche: "Heavy Equipment Operator", say: "Pick me!", ext: "png" },
  { img: "40-flooring", name: "Flooring", niche: "Flooring", say: "Pick me!", ext: "png" },
  { img: "41-fencing", name: "Fencing", niche: "Fencing", say: "Pick me!", ext: "png" },
  { img: "42-garage-door", name: "Garage Door", niche: "Garage Door", say: "Pick me!", ext: "png" },
  { img: "43-solar-installer", name: "Solar Installer", niche: "Solar Installer", say: "Pick me!", ext: "png" },
  { img: "44-pool-service", name: "Pool Service", niche: "Pool Service", say: "Pick me!", ext: "png" },
  { img: "45-insulation", name: "Insulation", niche: "Insulation", say: "Pick me!", ext: "png" },
  { img: "46-tile-setter", name: "Tile Setter", niche: "Tile Setter", say: "Pick me!", ext: "png" },
  { img: "47-glazier", name: "Glazier", niche: "Glazier", say: "Pick me!", ext: "png" },
  { img: "48-ironworker", name: "Ironworker", niche: "Ironworker", say: "Pick me!", ext: "png" },
  { img: "49-sheet-metal", name: "Sheet Metal", niche: "Sheet Metal", say: "Pick me!", ext: "png" },
  { img: "50-demolition", name: "Demolition", niche: "Demolition", say: "Pick me!", ext: "png" },
  { img: "51-arborist-tree-service", name: "Arborist Tree Service", niche: "Arborist Tree Service", say: "Pick me!", ext: "png" },
  { img: "52-pest-control", name: "Pest Control", niche: "Pest Control", say: "Pick me!", ext: "png" },
  { img: "53-locksmith", name: "Locksmith", niche: "Locksmith", say: "Pick me!", ext: "png" },
  { img: "54-appliance-repair", name: "Appliance Repair", niche: "Appliance Repair", say: "Pick me!", ext: "png" },
  { img: "55-handyman", name: "Handyman", niche: "Handyman", say: "Pick me!", ext: "png" },
  { img: "56-cleaning-maid-female", name: "Cleaning Maid", niche: "Cleaning Maid", say: "Pick me!", ext: "png" },
  { img: "57-junk-removal", name: "Junk Removal", niche: "Junk Removal", say: "Pick me!", ext: "png" },
  { img: "58-pressure-washing", name: "Pressure Washing", niche: "Pressure Washing", say: "Pick me!", ext: "png" },
  { img: "59-window-cleaner", name: "Window Cleaner", niche: "Window Cleaner", say: "Pick me!", ext: "png" },
  { img: "60-gutter-cleaning", name: "Gutter Cleaning", niche: "Gutter Cleaning", say: "Pick me!", ext: "png" },
  { img: "61-security-installer", name: "Security Installer", niche: "Security Installer", say: "Pick me!", ext: "png" },
  { img: "62-mover", name: "Mover", niche: "Mover", say: "Pick me!", ext: "png" },
  { img: "63-auto-detailer", name: "Auto Detailer", niche: "Auto Detailer", say: "Pick me!", ext: "png" },
  { img: "64-home-inspector", name: "Home Inspector", niche: "Home Inspector", say: "Pick me!", ext: "png" },
  { img: "65-countertop-cabinet", name: "Countertop Cabinet", niche: "Countertop Cabinet", say: "Pick me!", ext: "png" },
  { img: "66-snow-removal", name: "Snow Removal", niche: "Snow Removal", say: "Pick me!", ext: "png" },
  { img: "68-septic-service", name: "Septic Service", niche: "Septic Service", say: "Pick me!", ext: "png" },
  { img: "69-foundation-waterproofing", name: "Foundation Waterproofing", niche: "Foundation Waterproofing", say: "Pick me!", ext: "png" },
  { img: "70-deck-builder-female", name: "Deck Builder", niche: "Deck Builder", say: "Pick me!", ext: "png" },
  { img: "71-epoxy-floor-coating", name: "Epoxy Floor Coating", niche: "Epoxy Floor Coating", say: "Pick me!", ext: "png" },
  { img: "73-carpet-cleaner", name: "Carpet Cleaner", niche: "Carpet Cleaner", say: "Pick me!", ext: "png" },
  { img: "78-mobile-mechanic-female", name: "Mobile Mechanic", niche: "Mobile Mechanic", say: "Pick me!", ext: "png" },
  { img: "79-sign-installer", name: "Sign Installer", niche: "Sign Installer", say: "Pick me!", ext: "png" },
  { img: "81-mortgage-broker", name: "Mortgage Broker", niche: "Mortgage Broker", say: "Pick me!", ext: "png" },
  { img: "82-accountant-cpa", name: "Accountant Cpa", niche: "Accountant Cpa", say: "Pick me!", ext: "png" },
  { img: "84-photographer-male", name: "Photographer", niche: "Photographer", say: "Pick me!", ext: "png" },
  { img: "85-photographer-female", name: "Photographer", niche: "Photographer", say: "Pick me!", ext: "png" },
  { img: "86-esthetician", name: "Esthetician", niche: "Esthetician", say: "Pick me!", ext: "png" },
  { img: "87-lash-tech", name: "Lash Tech", niche: "Lash Tech", say: "Pick me!", ext: "png" },
  { img: "88-brow-artist", name: "Brow Artist", niche: "Brow Artist", say: "Pick me!", ext: "png" },
  { img: "89-makeup-artist", name: "Makeup Artist", niche: "Makeup Artist", say: "Pick me!", ext: "png" },
  { img: "90-spray-tan-tech", name: "Spray Tan Tech", niche: "Spray Tan Tech", say: "Pick me!", ext: "png" },
  { img: "91-waxing-specialist", name: "Waxing Specialist", niche: "Waxing Specialist", say: "Pick me!", ext: "png" },
  { img: "92-permanent-makeup-artist", name: "Permanent Makeup Artist", niche: "Permanent Makeup Artist", say: "Pick me!", ext: "png" },
  { img: "93-spa-attendant", name: "Spa Attendant", niche: "Spa Attendant", say: "Pick me!", ext: "png" },
  { img: "95-dog-groomer", name: "Dog Groomer", niche: "Dog Groomer", say: "Pick me!", ext: "png" },
  { img: "96-dog-trainer", name: "Dog Trainer", niche: "Dog Trainer", say: "Pick me!", ext: "png" },
  { img: "97-pet-sitter-dog-walker", name: "Pet Sitter Dog Walker", niche: "Pet Sitter Dog Walker", say: "Pick me!", ext: "png" },
  { img: "98-pet-boarding", name: "Pet Boarding", niche: "Pet Boarding", say: "Pick me!", ext: "png" },
  { img: "99-mobile-groomer", name: "Mobile Groomer", niche: "Mobile Groomer", say: "Pick me!", ext: "png" },
  { img: "100-auto-body-tech", name: "Auto Body Tech", niche: "Auto Body Tech", say: "Pick me!", ext: "png" },
  { img: "101-tire-tech", name: "Tire Tech", niche: "Tire Tech", say: "Pick me!", ext: "png" },
  { img: "102-oil-change-tech", name: "Oil Change Tech", niche: "Oil Change Tech", say: "Pick me!", ext: "png" },
  { img: "103-car-wash-attendant", name: "Car Wash Attendant", niche: "Car Wash Attendant", say: "Pick me!", ext: "png" },
  { img: "104-tow-truck-operator", name: "Tow Truck Operator", niche: "Tow Truck Operator", say: "Pick me!", ext: "png" },
  { img: "106-optometrist", name: "Optometrist", niche: "Optometrist", say: "Pick me!", ext: "png" },
  { img: "107-orthodontist", name: "Orthodontist", niche: "Orthodontist", say: "Pick me!", ext: "png" },
  { img: "108-dermatologist", name: "Dermatologist", niche: "Dermatologist", say: "Pick me!", ext: "png" },
  { img: "109-pediatrician", name: "Pediatrician", niche: "Pediatrician", say: "Pick me!", ext: "png" },
  { img: "110-physical-therapist", name: "Physical Therapist", niche: "Physical Therapist", say: "Pick me!", ext: "png" },
  { img: "111-dietitian", name: "Dietitian", niche: "Dietitian", say: "Pick me!", ext: "png" },
  { img: "112-pharmacist", name: "Pharmacist", niche: "Pharmacist", say: "Pick me!", ext: "png" },
  { img: "113-audiologist", name: "Audiologist", niche: "Audiologist", say: "Pick me!", ext: "png" },
  { img: "114-podiatrist", name: "Podiatrist", niche: "Podiatrist", say: "Pick me!", ext: "png" },
  { img: "115-home-caregiver", name: "Home Caregiver", niche: "Home Caregiver", say: "Pick me!", ext: "png" },
  { img: "119-personal-trainer", name: "Personal Trainer", niche: "Personal Trainer", say: "Pick me!", ext: "png" },
  { img: "122-barista-male", name: "Barista", niche: "Barista", say: "Pick me!", ext: "png" },
  { img: "123-food-truck-cook", name: "Food Truck Cook", niche: "Food Truck Cook", say: "Pick me!", ext: "png" },
  { img: "124-caterer-female", name: "Caterer", niche: "Caterer", say: "Pick me!", ext: "png" },
  { img: "125-bartender-male", name: "Bartender", niche: "Bartender", say: "Pick me!", ext: "png" },
  { img: "125-bartender-female", name: "Bartender", niche: "Bartender", say: "Pick me!", ext: "png" },
  { img: "125-bartender-female-edgy", name: "Bartender", niche: "Bartender", say: "Pick me!", ext: "png" },
  { img: "126-butcher", name: "Butcher", niche: "Butcher", say: "Pick me!", ext: "png" },
  { img: "127-brewer", name: "Brewer", niche: "Brewer", say: "Pick me!", ext: "png" },
  { img: "128-financial-advisor", name: "Financial Advisor", niche: "Financial Advisor", say: "Pick me!", ext: "png" },
  { img: "129-bookkeeper", name: "Bookkeeper", niche: "Bookkeeper", say: "Pick me!", ext: "png" },
  { img: "130-notary", name: "Notary", niche: "Notary", say: "Pick me!", ext: "png" },
  { img: "131-it-technician", name: "IT Technician", niche: "IT Technician", say: "Pick me!", ext: "png" },
  { img: "132-marketing-creative", name: "Marketing Creative", niche: "Marketing Creative", say: "Pick me!", ext: "png" },
  { img: "133-recruiter", name: "Recruiter", niche: "Recruiter", say: "Pick me!", ext: "png" },
  { img: "134-business-consultant", name: "Business Consultant", niche: "Business Consultant", say: "Pick me!", ext: "png" },
  { img: "135-web-designer", name: "Web Designer", niche: "Web Designer", say: "Pick me!", ext: "png" },
  { img: "136-property-manager-female", name: "Property Manager", niche: "Property Manager", say: "Pick me!", ext: "png" },
  { img: "137-appraiser", name: "Appraiser", niche: "Appraiser", say: "Pick me!", ext: "png" },
  { img: "139-escrow-officer", name: "Escrow Officer", niche: "Escrow Officer", say: "Pick me!", ext: "png" },
  { img: "141-event-planner-female", name: "Event Planner", niche: "Event Planner", say: "Pick me!", ext: "png" },
  { img: "142-dj", name: "Dj", niche: "Dj", say: "Pick me!", ext: "png" },
  { img: "143-videographer", name: "Videographer", niche: "Videographer", say: "Pick me!", ext: "png" },
  { img: "144-party-rental-female", name: "Party Rental", niche: "Party Rental", say: "Pick me!", ext: "png" },
  { img: "145-graphic-designer", name: "Graphic Designer", niche: "Graphic Designer", say: "Pick me!", ext: "png" },
  { img: "146-preschool-teacher", name: "Preschool Teacher", niche: "Preschool Teacher", say: "Pick me!", ext: "png" },
  { img: "147-tutor", name: "Tutor", niche: "Tutor", say: "Pick me!", ext: "png" },
  { img: "148-driving-instructor", name: "Driving Instructor", niche: "Driving Instructor", say: "Pick me!", ext: "png" },
  { img: "151-smart-home-installer", name: "Smart Home Installer", niche: "Smart Home Installer", say: "Pick me!", ext: "png" },
  { img: "151-smart-home-installer-white", name: "Smart Home Installer White", niche: "Smart Home Installer White", say: "Pick me!", ext: "png" },
  { img: "152-ev-charger-installer", name: "EV Charger Installer", niche: "EV Charger Installer", say: "Pick me!", ext: "png" },
  { img: "154-low-voltage-tech", name: "Low Voltage Tech", niche: "Low Voltage Tech", say: "Pick me!", ext: "png" },
  { img: "155-holiday-lighting", name: "Holiday Lighting", niche: "Holiday Lighting", say: "Pick me!", ext: "png" },
  { img: "156-turf-installer", name: "Turf Installer", niche: "Turf Installer", say: "Pick me!", ext: "png" },
  { img: "158-dry-cleaner", name: "Dry Cleaner", niche: "Dry Cleaner", say: "Pick me!", ext: "png" },
  { img: "159-tailor-seamstress", name: "Tailor Seamstress", niche: "Tailor Seamstress", say: "Pick me!", ext: "png" },
  { img: "160-jeweler", name: "Jeweler", niche: "Jeweler", say: "Pick me!", ext: "png" },
  { img: "161-travel-agent-female", name: "Travel Agent", niche: "Travel Agent", say: "Pick me!", ext: "png" },
  { img: "162-funeral-director", name: "Funeral Director", niche: "Funeral Director", say: "Pick me!", ext: "png" },
  { img: "163-courier-delivery", name: "Courier Delivery", niche: "Courier Delivery", say: "Pick me!", ext: "png" },
  { img: "164-realtor-female-bubbly", name: "Realtor Bubbly", niche: "Realtor Bubbly", say: "Pick me!", ext: "png" },
  { img: "165-house-cleaner-female", name: "House Cleaner", niche: "House Cleaner", say: "Pick me!", ext: "png" },
  { img: "166-insurance-agent-female", name: "Insurance Agent", niche: "Insurance Agent", say: "Pick me!", ext: "png" },
  { img: "167-dentist-female", name: "Dentist", niche: "Dentist", say: "Pick me!", ext: "png" },
  { img: "168-hair-stylist-female", name: "Hair Stylist", niche: "Hair Stylist", say: "Pick me!", ext: "png" },
  { img: "169-nail-tech-female", name: "Nail Tech", niche: "Nail Tech", say: "Pick me!", ext: "png" },
  { img: "170-fitness-coach-female", name: "Fitness Coach", niche: "Fitness Coach", say: "Pick me!", ext: "png" },
  { img: "171-medspa-esthetician", name: "Medspa Esthetician", niche: "Medspa Esthetician", say: "Pick me!", ext: "png" },
  { img: "172-barista", name: "Barista", niche: "Barista", say: "Pick me!", ext: "png" },
  { img: "173-dog-groomer-female", name: "Dog Groomer", niche: "Dog Groomer", say: "Pick me!", ext: "png" },
  { img: "174-baker-female", name: "Baker", niche: "Baker", say: "Pick me!", ext: "png" },
  { img: "175-attorney-female", name: "Attorney", niche: "Attorney", say: "Pick me!", ext: "png" },
  { img: "176-veterinarian-female", name: "Veterinarian", niche: "Veterinarian", say: "Pick me!", ext: "png" },
  { img: "192-chiropractor", name: "Chiropractor", niche: "Chiropractor", say: "Pick me!", ext: "png" },
  { img: "193-chimney-sweep", name: "Chimney Sweep", niche: "Chimney Sweep", say: "Pick me!", ext: "png" },
  { img: "194-interior-designer", name: "Interior Designer", niche: "Interior Designer", say: "Pick me!", ext: "png" },
  { img: "195-music-teacher", name: "Music Teacher", niche: "Music Teacher", say: "Pick me!", ext: "png" },
  { img: "196-dance-instructor", name: "Dance Instructor", niche: "Dance Instructor", say: "Pick me!", ext: "png" },
  { img: "197-swim-instructor", name: "Swim Instructor", niche: "Swim Instructor", say: "Pick me!", ext: "png" },
  { img: "198-martial-arts-instructor", name: "Martial Arts Instructor", niche: "Martial Arts Instructor", say: "Pick me!", ext: "png" },
  { img: "199-social-media-manager", name: "Social Media Manager", niche: "Social Media Manager", say: "Pick me!", ext: "png" },
  { img: "200-copywriter", name: "Copywriter", niche: "Copywriter", say: "Pick me!", ext: "png" },
  { img: "201-podcast-producer", name: "Podcast Producer", niche: "Podcast Producer", say: "Pick me!", ext: "png" },
  { img: "202-virtual-assistant", name: "Virtual Assistant", niche: "Virtual Assistant", say: "Pick me!", ext: "png" },
  { img: "203-yoga-instructor", name: "Yoga Instructor", niche: "Yoga Instructor", say: "Pick me!", ext: "png" },
  { img: "204-pilates-instructor", name: "Pilates Instructor", niche: "Pilates Instructor", say: "Pick me!", ext: "png" },
  { img: "205-life-coach", name: "Life Coach", niche: "Life Coach", say: "Pick me!", ext: "png" },
  { img: "206-acupuncturist", name: "Acupuncturist", niche: "Acupuncturist", say: "Pick me!", ext: "png" },
  { img: "207-home-stager", name: "Home Stager", niche: "Home Stager", say: "Pick me!", ext: "png" },
  { img: "208-water-treatment-tech", name: "Water Treatment Tech", niche: "Water Treatment Tech", say: "Pick me!", ext: "png" },
  { img: "209-fireplace-specialist", name: "Fireplace Specialist", niche: "Fireplace Specialist", say: "Pick me!", ext: "png" },
  { img: "210-awning-installer", name: "Awning Installer", niche: "Awning Installer", say: "Pick me!", ext: "png" },
  { img: "211-garage-door-tech", name: "Garage Door Tech", niche: "Garage Door Tech", say: "Pick me!", ext: "png" },
  { img: "212-gutter-installer", name: "Gutter Installer", niche: "Gutter Installer", say: "Pick me!", ext: "png" },
  { img: "213-mobile-detailer", name: "Mobile Detailer", niche: "Mobile Detailer", say: "Pick me!", ext: "png" },
  { img: "214-pool-builder", name: "Pool Builder", niche: "Pool Builder", say: "Pick me!", ext: "png" },
  { img: "215-solar-sales-rep", name: "Solar Sales Rep", niche: "Solar Sales Rep", say: "Pick me!", ext: "png" },
  { img: "216-pressure-wash-pro", name: "Pressure Wash Pro", niche: "Pressure Wash Pro", say: "Pick me!", ext: "png" },
  { img: "217-handyman-female", name: "Handyman", niche: "Handyman", say: "Pick me!", ext: "png" },
  { img: "218-irrigation-tech", name: "Irrigation Tech", niche: "Irrigation Tech", say: "Pick me!", ext: "png" },
  { img: "219-optometrist", name: "Optometrist", niche: "Optometrist", say: "Pick me!", ext: "png" },
  { img: "220-orthodontist", name: "Orthodontist", niche: "Orthodontist", say: "Pick me!", ext: "png" },
  { img: "221-obgyn", name: "OB-GYN", niche: "OB-GYN", say: "Pick me!", ext: "png" },
  { img: "222-phlebotomist", name: "Phlebotomist", niche: "Phlebotomist", say: "Pick me!", ext: "png" },
  { img: "223-physical-therapist-male", name: "Physical Therapist", niche: "Physical Therapist", say: "Pick me!", ext: "png" },
  { img: "224-pharmacist-male", name: "Pharmacist", niche: "Pharmacist", say: "Pick me!", ext: "png" },
  { img: "225-speech-therapist", name: "Speech Therapist", niche: "Speech Therapist", say: "Pick me!", ext: "png" },
  { img: "226-home-health-nurse", name: "Home Health Nurse", niche: "Home Health Nurse", say: "Pick me!", ext: "png" },
  { img: "227-mobile-iv-nurse", name: "Mobile IV Nurse", niche: "Mobile IV Nurse", say: "Pick me!", ext: "png" },
  { img: "228-coffee-shop-owner", name: "Coffee Shop Owner", niche: "Coffee Shop Owner", say: "Pick me!", ext: "png" },
  { img: "229-boutique-owner", name: "Boutique Owner", niche: "Boutique Owner", say: "Pick me!", ext: "png" },
  { img: "230-bookstore-owner", name: "Bookstore Owner", niche: "Bookstore Owner", say: "Pick me!", ext: "png" },
  { img: "231-pet-store-owner", name: "Pet Store Owner", niche: "Pet Store Owner", say: "Pick me!", ext: "png" },
  { img: "232-hardware-store-owner", name: "Hardware Store Owner", niche: "Hardware Store Owner", say: "Pick me!", ext: "png" },
  { img: "233-bakery-owner", name: "Bakery Owner", niche: "Bakery Owner", say: "Pick me!", ext: "png" },
  { img: "234-consignment-shop-owner", name: "Consignment Shop Owner", niche: "Consignment Shop Owner", say: "Pick me!", ext: "png" },
  { img: "235-florist", name: "Florist", niche: "Florist", say: "Pick me!", ext: "png" },
  { img: "236-bulldog", name: "Bulldog", niche: "Bulldog mascot", say: "Pick me!", ext: "png" },
  { img: "237-lion", name: "Lion", niche: "Lion mascot", say: "Pick me!", ext: "png" },
  { img: "238-eagle", name: "Eagle", niche: "Eagle mascot", say: "Pick me!", ext: "png" },
  { img: "239-bear", name: "Bear", niche: "Bear mascot", say: "Pick me!", ext: "png" },
  { img: "240-fox", name: "Fox", niche: "Fox mascot", say: "Pick me!", ext: "png" },
  { img: "241-owl", name: "Owl", niche: "Owl mascot", say: "Pick me!", ext: "png" },
  { img: "242-tiger", name: "Tiger", niche: "Tiger mascot", say: "Pick me!", ext: "png" },
  { img: "243-wolf", name: "Wolf", niche: "Wolf mascot", say: "Pick me!", ext: "png" },
];

const STATS = [
  { n: "24/7", l: "Always answering" },
  { n: "<2s", l: "Average reply time" },
  { n: "100%", l: "Of visitors greeted" },
  { n: "0", l: "Leads missed after hours" },
];

const CHAT_CONS = ["Sits silent until someone clicks it", "Looks like every other website", "Feels like tech support", "Easy to scroll past and ignore"];
const MASCOT_PROS = ["Greets and talks to every visitor", "100% your brand and personality", "Feels like a real person", "Impossible to miss — and asks for the booking"];

const TESTIMONIALS = [
  { q: "It booked three jobs the first weekend — while we were closed. Paid for itself before Monday.", a: "Marcus T.", b: "Roofing company", r: "+3 jobs, weekend one" },
  { q: "Like having a receptionist who never clocks out or calls in sick. Every lead gets answered in seconds.", a: "Dana R.", b: "Real estate", r: "~40% more inquiries replied" },
  { q: "Zero effort on our end. They built it, host it, and keep it sharp. We just take the booked calls.", a: "Priya S.", b: "Med-spa", r: "Set up in under a week" },
];
const PROOF_BAND = [
  { n: "24/7", l: "Answers every visitor, day or night" },
  { n: "< 5 sec", l: "Average reply speed" },
  { n: "5★", l: "Owners rate the hands-off setup" },
];

const FAQS = [
  { q: "How much does it cost?", a: "Your mascot is a one-time build: $499 for a predesigned character, $999 to rig a mascot you already have, or $1,499 for a full custom mascot — including one made to look like you from a few photos. Then a flat monthly plan from $99/mo — no per-message credits or surprise bills. We host it, monitor it, and keep it sharp. Cancel anytime." },
  { q: "How long until it's live on my site?", a: "About a week. We design the mascot, train it on your business, and hand you one line of code to drop in — or we add it for you." },
  { q: "Do I have to do anything?", a: "No. It's fully done-for-you. We build it, host it, monitor it, and tune it every month. You just collect the leads." },
  { q: "Can it use my own mascot or logo?", a: "Yes — bring your own character, or we design one that fits your brand. Either way it's uniquely yours." },
  { q: "What if it answers something wrong?", a: "It's trained only on your business, so answers stay accurate. We monitor conversations and tune it monthly, and it always offers a human handoff when needed." },
  { q: "Where do the leads go?", a: "Straight to you the moment they come in — email, text, or your CRM — and booked right onto your calendar." },
];

export default async function Home() {
  const bookingUrl = await getSetting("ghl_calendar_url", "https://api.leadconnectorhq.com/widget/booking/bYPWHLo2QmfN4WVHqVr1");
  return (
    <main className="min-h-screen bg-paper text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                name: "MascotChatbot",
                url: "https://mascotchatbot.com",
                logo: "https://mascotchatbot.com/icon.svg",
                email: "hello@mascotchatbot.com",
                telephone: "+1-801-433-7000",
                contactPoint: { "@type": "ContactPoint", telephone: "+1-801-433-7000", email: "hello@mascotchatbot.com", contactType: "customer service" },
                description: "Custom animated AI mascots that greet website visitors, answer their questions, and book jobs 24/7.",
              },
              { "@type": "WebSite", name: "MascotChatbot", url: "https://mascotchatbot.com" },
              {
                "@type": "FAQPage",
                mainEntity: FAQS.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
            ],
          }),
        }}
      />
      <style>{`
@keyframes heroFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:heroFadeUp .75s cubic-bezier(.2,.7,.2,1) both}
@keyframes heroFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.hero-float{animation:heroFloat 7s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){.fade-up,.hero-float{animation:none}}
`}</style>
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/70 backdrop-blur-xl">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <a href="#top" className="group flex items-center gap-2.5 text-2xl font-bold tracking-tightest">
            <svg width="48" height="36" viewBox="100 52 182 138" aria-hidden="true" className="transition-transform duration-300 group-hover:scale-105">
              <rect x="104" y="104" width="14" height="40" rx="7" fill="#3a434f" />
              <rect x="262" y="104" width="14" height="40" rx="7" fill="#3a434f" />
              <rect x="115" y="58" width="150" height="116" rx="42" fill="#e4e9ef" stroke="#aab4c0" strokeWidth="3" />
              <ellipse cx="190" cy="118" rx="60" ry="44" fill="#2b333d" />
              <rect x="164" y="98" width="14" height="26" rx="7" fill="#2bc4e6" />
              <rect x="202" y="98" width="14" height="26" rx="7" fill="#2bc4e6" />
              <path d="M164 130 Q190 160 216 130 Z" fill="#2bc4e6" />
              <path d="M112 146 C 116 186, 150 194, 182 176" fill="none" stroke="#3a434f" strokeWidth="8" strokeLinecap="round" />
              <ellipse cx="184" cy="176" rx="10" ry="7" fill="#3a434f" />
            </svg>
            <span>Mascot<span className="text-smoke">Chatbot</span></span>
          </a>
          <div className="flex items-center gap-3 md:gap-6">
            <nav className="hidden gap-7 text-sm font-medium text-smoke lg:flex"><a href="/gallery" className="group relative py-1 transition-colors hover:text-ink">Gallery<span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100" /></a>
              <a href="#how" className="group relative py-1 transition-colors hover:text-ink">How it works<span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100" /></a>
              <a href="#demos" className="group relative py-1 transition-colors hover:text-ink">Demos<span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100" /></a>
              <a href="#pricing" className="group relative py-1 transition-colors hover:text-ink">Pricing<span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100" /></a>
              <a href="#faq" className="group relative py-1 transition-colors hover:text-ink">FAQ<span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100" /></a>
            </nav>
            <a href="#pricing" className="group hidden items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-[0_4px_14px_rgba(10,10,10,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(10,10,10,0.32)] md:inline-flex">
              Get your mascot<span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <MobileNav />
            <NavActions />
          </div>
        </div>
      </header>

      {/* LOOKS-LIKE-YOU CALLOUT */}
      <a href="#pricing" className="group block border-b-2 border-ink bg-ink text-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 py-2.5 text-center text-sm">
          <span className="rounded-full bg-[#e3342b] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">New</span>
          <span className="font-semibold">Want a mascot that looks like <span className="italic">you</span>?</span>
          <span className="text-paper/70">Send a few photos and we&apos;ll design one in your likeness.</span>
          <span className="font-semibold underline underline-offset-4 transition group-hover:opacity-80">See options →</span>
        </div>
      </a>

      {/* HERO */}
      <section id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(#0A0A0A 1.2px, transparent 1.2px)", backgroundSize: "22px 22px" }} />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full opacity-70 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(227,52,43,0.16), rgba(227,52,43,0) 70%)" }} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 md:grid-cols-[1.05fr_0.95fr] md:pt-20">
          <div>
            <p className="fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest shadow-sm backdrop-blur" style={{ animationDelay: "0ms" }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e3342b] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e3342b]" />
              </span>
              Animated AI mascots for websites
            </p>
            <style dangerouslySetInnerHTML={{ __html: TALK_CSS }} />
            <h1 className="fade-up text-[15vw] font-bold leading-[0.84] tracking-tightest md:text-[7.5rem]" style={{ animationDelay: "80ms" }}>
              Your brand,<br />
              <span className="mc-talk">talking.</span><span className="mc-eq" aria-hidden="true"><i style={{ animationDelay: "0s" }} /><i style={{ animationDelay: ".15s" }} /><i style={{ animationDelay: ".3s" }} /><i style={{ animationDelay: ".2s" }} /></span>
            </h1>
            <p className="fade-up mt-8 max-w-md text-lg leading-relaxed text-smoke" style={{ animationDelay: "160ms" }}>
              We build a custom animated mascot that lives on your site, talks to visitors, answers questions, and books the job — <b className="text-ink">24/7, done for you, hosted by us.</b>
            </p>
            <p className="fade-up mt-4 max-w-md text-base font-semibold leading-relaxed text-ink" style={{ animationDelay: "200ms" }}>
              Your 24/7 digital salesman — setting appointments, answering questions, and assisting your clients.
            </p>
            <div className="fade-up mt-9 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
              <a href="/account" className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-semibold text-paper shadow-[0_8px_22px_rgba(10,10,10,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(10,10,10,0.35)]">
                Start free <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
              <OpenMascot className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper/60 px-7 py-3.5 font-semibold backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink hover:text-paper">
                ▶ See it talk
              </OpenMascot>
              <a href="#book" className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper/60 px-7 py-3.5 font-semibold backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink hover:text-paper">
                Book a call
              </a>
            </div>
            <div className="fade-up mt-8 flex flex-wrap items-center gap-x-6 gap-y-3" style={{ animationDelay: "320ms" }}>
              <span className="flex items-center gap-2 text-sm font-medium text-smoke"><span className="tracking-tight text-[#e3342b]">★★★★★</span> Loved by local service businesses</span>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-smoke">
                {["No code", "Done-for-you", "Live in ~a week", "Cancel anytime"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5"><span className="text-ink">✓</span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="fade-up flex justify-center md:justify-end" style={{ animationDelay: "200ms" }}>
            <HeroBot />
          </div>
        </div>
      </section>

      {/* MARQUEE — mascot faces over a black name bar; slow, pause on hover, click to pick */}
      <MascotMarquee mascots={CHARACTERS} />

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24">
        <h2 className="mb-14 max-w-2xl text-4xl font-bold tracking-tightest md:text-6xl">
          A salesperson that never sleeps.
        </h2>
        <div className="grid gap-px border-2 border-ink bg-ink md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-paper p-8">
              <div className="mb-6 text-sm font-bold text-smoke">{s.n}</div>
              <h3 className="mb-3 text-2xl font-bold tracking-tight">{s.t}</h3>
              <p className="text-smoke leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY A MASCOT */}
      <section id="why" className="scroll-mt-24 border-t-2 border-ink bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <h2 className="mb-3 max-w-3xl text-4xl font-bold tracking-tightest md:text-6xl">
            A mascot converts. A chat box doesn&apos;t.
          </h2>
          <p className="mb-14 max-w-2xl text-lg leading-relaxed text-smoke">
            Most visitors never click the little chat bubble in the corner — it blends in and feels like tech support. A mascot greets them, talks, and asks for the booking. Engaged visitors are the ones who convert, so more of your traffic turns into actual leads and booked jobs.
          </p>

          <div className="grid gap-px overflow-hidden rounded-3xl border-2 border-ink bg-ink md:grid-cols-2">
            {/* Plain chat */}
            <div className="bg-paper p-8 md:p-10">
              <div className="mb-6 text-xs font-bold uppercase tracking-widest text-smoke">A plain chat window</div>
              <ul className="space-y-4">
                {CHAT_CONS.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-smoke">
                    <svg width="20" height="20" viewBox="0 0 20 20" className="mt-0.5 shrink-0" aria-hidden="true">
                      <circle cx="10" cy="10" r="9" fill="none" stroke="#9a9a9a" strokeWidth="1.5" />
                      <path d="M7 7l6 6M13 7l-6 6" stroke="#9a9a9a" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            {/* Mascot */}
            <div className="bg-ink p-8 text-paper md:p-10">
              <div className="mb-6 text-xs font-bold uppercase tracking-widest text-paper/60">Your talking mascot</div>
              <ul className="space-y-4">
                {MASCOT_PROS.map((c) => (
                  <li key={c} className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 20 20" className="mt-0.5 shrink-0" aria-hidden="true">
                      <circle cx="10" cy="10" r="10" fill="#ffffff" />
                      <path d="M5.5 10.5l2.8 2.8 6-6.4" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DEMOS / GALLERY */}
      <section id="demos" className="scroll-mt-24 border-t-2 border-ink bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-bold tracking-tightest md:text-6xl">Meet the family.</h2>
            <p className="max-w-sm text-smoke"><b className="text-ink">Robo is live right now</b> — click him in the bottom-right corner (turn your sound on), or tap his card. Tap any mascot to pick it and get started.</p>
          </div>

          {/* Robo — live demo */}
          <OpenMascot className="group mb-10 flex w-full items-center gap-6 rounded-3xl border-2 border-ink bg-ink p-6 text-left text-paper transition hover:opacity-90 md:p-8">
            <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-paper">
              <svg width="74" height="56" viewBox="100 52 182 138" aria-hidden="true">
                <rect x="104" y="104" width="14" height="40" rx="7" fill="#3a434f" />
                <rect x="262" y="104" width="14" height="40" rx="7" fill="#3a434f" />
                <rect x="115" y="58" width="150" height="116" rx="42" fill="#e4e9ef" stroke="#aab4c0" strokeWidth="3" />
                <ellipse cx="190" cy="118" rx="60" ry="44" fill="#2b333d" />
                <rect x="164" y="98" width="14" height="26" rx="7" fill="#2bc4e6" />
                <rect x="202" y="98" width="14" height="26" rx="7" fill="#2bc4e6" />
                <path d="M164 130 Q190 160 216 130 Z" fill="#2bc4e6" />
                <path d="M112 146 C 116 186, 150 194, 182 176" fill="none" stroke="#3a434f" strokeWidth="8" strokeLinecap="round" />
                <ellipse cx="184" cy="176" rx="10" ry="7" fill="#3a434f" />
              </svg>
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-smoke">
                MascotChatbot <span className="rounded-full bg-[#e3342b] px-2 py-0.5 text-[10px] text-paper">LIVE</span>
              </span>
              <span className="mt-1 block text-3xl font-bold tracking-tight">Robo</span>
              <span className="mt-1 block text-smoke">Our own talking mascot — click to chat with him live.</span>
            </span>
            <span className="hidden shrink-0 text-lg font-semibold md:block">talk to Robo →</span>
          </OpenMascot>

          {/* Full roster — click any to pick + go to checkout */}
          <MascotRoster mascots={CHARACTERS} />
          <p className="mt-6 text-sm text-smoke">Don&apos;t see your industry? We build any character for any business — that&apos;s the whole point.</p>
        </div>
      </section>

      {/* STATS */}
      <section className="border-t-2 border-ink bg-ink text-paper">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l} className="px-5 py-12 text-center">
              <div className="text-5xl font-bold tracking-tightest md:text-6xl">{s.n}</div>
              <div className="mt-2 text-sm text-smoke">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <Pricing />

      {/* SOCIAL PROOF */}
      <section className="border-t-2 border-ink bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-2xl text-4xl font-bold tracking-tightest md:text-6xl">
              Built to win you business.
            </h2>
            <div className="flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-4 py-2 text-sm">
              <span className="text-lg leading-none" style={{ color: "#e3342b" }} aria-hidden="true">★★★★★</span>
              <span className="font-semibold">Loved by local business owners</span>
            </div>
          </div>

          <div className="mb-10 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-ink/15 bg-ink/10 sm:grid-cols-3">
            {PROOF_BAND.map((p) => (
              <div key={p.n} className="bg-paper px-6 py-8 text-center">
                <div className="text-4xl font-bold tracking-tightest md:text-5xl">{p.n}</div>
                <div className="mt-2 text-sm text-smoke">{p.l}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.q} className="flex flex-col rounded-3xl border border-ink/15 bg-paper p-8 shadow-sm">
                <div className="mb-3 text-lg leading-none" style={{ color: "#e3342b" }} aria-hidden="true">★★★★★</div>
                <blockquote className="flex-1 text-lg leading-relaxed">{t.q}</blockquote>
                <span className="mt-5 inline-flex w-fit rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper">{t.r}</span>
                <figcaption className="mt-5 border-t border-ink/10 pt-4 text-sm">
                  <span className="font-bold">{t.a}</span>
                  <span className="text-smoke"> · {t.b}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-8 text-xs text-smoke">Illustrative results from early customers. Your mileage will vary by traffic and offer.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 border-t-2 border-ink bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-24">
          <h2 className="mb-14 text-4xl font-bold tracking-tightest md:text-6xl">Questions, answered.</h2>
          <div className="divide-y divide-ink/10 border-y border-ink/10">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold marker:content-none">
                  {f.q}
                  <span className="shrink-0 text-2xl font-normal text-smoke transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl leading-relaxed text-smoke">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* BOOK */}
      <section id="book" className="scroll-mt-24 border-t-2 border-ink bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-24">
          <h2 className="text-4xl font-bold tracking-tightest md:text-5xl">Book an appointment</h2>
          <p className="mt-3 max-w-xl text-lg text-smoke">Grab a time that works for you and we&apos;ll take it from there. ⚡</p>
          {bookingUrl ? (
            <iframe
              src={bookingUrl}
              title="Book an appointment"
              className="mt-8 w-full rounded-2xl border-2 border-ink bg-white"
              style={{ minHeight: 760 }}
            />
          ) : (
            <div className="mt-8 rounded-2xl border-2 border-ink bg-white p-8 text-center">
              <p className="text-lg font-semibold text-ink">Online booking is being set up.</p>
              <p className="mt-2 text-smoke">In the meantime, drop your details just below and we&apos;ll reach out to schedule you right away.</p>
              <a href="#cta" className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ink px-6 py-3 font-semibold text-paper shadow-[0_8px_22px_rgba(10,10,10,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(10,10,10,0.35)]">Get in touch →</a>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="scroll-mt-24 bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-5 py-28 text-center">
          <h2 className="mx-auto max-w-4xl text-5xl font-bold leading-[0.9] tracking-tightest md:text-8xl">
            Put a mascot on your site.
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-lg text-smoke">
            Tell us your business. We&apos;ll build a talking demo of your own mascot — free — before you pay a cent.
          </p>
          <LeadForm />
          <p className="mt-6 text-sm text-smoke">Prefer to talk? <a href="#book" className="font-semibold text-paper underline underline-offset-4 hover:opacity-80">Book a call →</a></p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
