import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  Camera,
  ChefHat,
  Compass,
  Flame,
  Flower2,
  Music2,
  Plane,
  Sparkles,
  UtensilsCrossed,
  BedDouble,
} from "lucide-react";

export interface BCRegistrationType {
  id: string;
  label: string;
  icon: LucideIcon;
}

/** Business types shown during registration (workspace setup only). */
export const BC_REGISTRATION_TYPES: BCRegistrationType[] = [
  { id: "priest", label: "Archaka / Priest", icon: Flame },
  { id: "astrologer", label: "Astrologer", icon: Sparkles },
  { id: "vastu", label: "Vastu Consultant", icon: Compass },
  { id: "caterer", label: "Caterer", icon: ChefHat },
  { id: "hotel", label: "Hotel / Lodge", icon: BedDouble },
  { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { id: "travel", label: "Travel Provider", icon: Plane },
  { id: "decorator", label: "Decorator", icon: Flower2 },
  { id: "musician", label: "Musician", icon: Music2 },
  { id: "photographer", label: "Photographer", icon: Camera },
  { id: "flower", label: "Flower Vendor", icon: Flower2 },
  { id: "other", label: "Other", icon: Boxes },
];
