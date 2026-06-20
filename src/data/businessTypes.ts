import {
  Flame,
  Sparkles,
  Compass,
  UtensilsCrossed,
  BedDouble,
  ChefHat,
  Plane,
  Flower2,
  Music2,
  Camera,
  Leaf,
  Store,
  Boxes,
  type LucideIcon,
} from "lucide-react";

export interface BusinessTypeDef {
  id: string;
  label: string;
  icon: LucideIcon;
  subcategories: string[];
}

export const BUSINESS_TYPES: BusinessTypeDef[] = [
  {
    id: "priest",
    label: "Priest / Archaka",
    icon: Flame,
    subcategories: ["Smartha", "Madhwa", "Srivaishnava", "Shaiva", "Shakta", "Other"],
  },
  {
    id: "astrologer",
    label: "Astrologer",
    icon: Sparkles,
    subcategories: ["Vedic", "Nadi", "KP System", "Numerology", "Tarot"],
  },
  {
    id: "vastu",
    label: "Vastu Consultant",
    icon: Compass,
    subcategories: ["Residential", "Commercial", "Temple Vastu"],
  },
  {
    id: "caterer",
    label: "Caterer",
    icon: ChefHat,
    subcategories: ["Pure Veg", "Sattvic", "South Indian", "North Indian", "Bulk Prasadam"],
  },
  {
    id: "hotel",
    label: "Hotel / Lodge",
    icon: BedDouble,
    subcategories: ["Budget", "Mid-range", "Premium", "Dharmashala"],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    icon: UtensilsCrossed,
    subcategories: ["Pure Veg", "Sattvic", "Multi-cuisine"],
  },
  {
    id: "travel",
    label: "Travel Provider",
    icon: Plane,
    subcategories: ["Cab", "Tempo Traveller", "Bus", "Tour Package"],
  },
  {
    id: "decorator",
    label: "Decorator",
    icon: Flower2,
    subcategories: ["Floral", "Mandap", "Lighting", "Stage"],
  },
  {
    id: "musician",
    label: "Musician",
    icon: Music2,
    subcategories: ["Nadaswaram", "Bhajan Group", "Carnatic Vocal", "Mridangam"],
  },
  {
    id: "photographer",
    label: "Photographer",
    icon: Camera,
    subcategories: ["Event", "Wedding", "Ritual", "Videography"],
  },
  {
    id: "flower",
    label: "Flower Vendor",
    icon: Leaf,
    subcategories: ["Daily Supply", "Garlands", "Festival Bulk"],
  },
  {
    id: "vendor",
    label: "Temple Service Vendor",
    icon: Store,
    subcategories: ["Pooja Items", "Utensils", "Cleaning", "Maintenance"],
  },
  {
    id: "other",
    label: "Other",
    icon: Boxes,
    subcategories: ["Other"],
  },
];

export const LANGUAGES = [
  "Kannada",
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Malayalam",
  "Marathi",
  "Sanskrit",
];

export const COMM_CHANNELS = ["Phone Calls", "WhatsApp", "SMS", "Email"];

export interface PlanDef {
  id: "trial" | "basic" | "pro" | "premium";
  name: string;
  price: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
}

export const PLANS: PlanDef[] = [
  {
    id: "trial",
    name: "Free Trial",
    price: "₹0",
    tagline: "14 days. Limited profile visibility.",
    features: ["Basic listing", "1 photo", "Local visibility"],
  },
  {
    id: "basic",
    name: "Basic",
    price: "₹499/mo",
    tagline: "Get found in AI search.",
    features: ["Business listing", "AI search visibility", "5 photos", "District visibility"],
  },
  {
    id: "pro",
    name: "Professional",
    price: "₹1,499/mo",
    tagline: "Enhanced reach for serious businesses.",
    features: ["Everything in Basic", "Enhanced visibility", "20 photos + videos", "Statewide reach", "Verified badge"],
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹3,499/mo",
    tagline: "Top priority placement.",
    features: ["Everything in Pro", "Priority placement", "Unlimited media", "Nationwide reach", "Featured in category"],
  },
];
