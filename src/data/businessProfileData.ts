import type { BusinessProfile } from "@/types/businessProfile";
import templeHero from "@/assets/temple-hero.jpg";
import heroTemple from "@/assets/hero-temple.jpg";
import { DEMO_PROFILE_MEDIA } from "@/data/businessProfileMedia";

/** Single demo business profile — seeded when localStorage is empty. */
export const businessProfilesSeedData: BusinessProfile[] = [
  {
    id: "BP-0001",
    businessName: "Shree Krishna Pooja Services",
    businessType: "priest",
    category: "Smartha",
    about:
      "Experienced Vedic priest offering homams, weddings, griha pravesham, and daily archana across Bengaluru. Sanskrit mantras with clear Kannada and English explanation for devotees. Registered with Karnataka Temple Board. Available for home visits and temple ceremonies.",
    experience: "18",
    ownerName: "Pt. Venkatesh Sharma",
    mobile: "+91 98450 12345",
    whatsapp: "+91 98450 12345",
    email: "venkatesh@shreekrishnapooja.in",
    address: "42, Temple Road, Jayanagar 4th Block",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    state: "Karnataka",
    pincode: "560041",
    languages: ["Kannada", "English", "Hindi", "Tamil"],
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    openingTime: "05:30",
    closingTime: "21:00",
    logo: DEMO_PROFILE_MEDIA.logo,
    coverImage: templeHero,
    gallery: [templeHero, heroTemple, templeHero],
    aadhaar: "XXXX-XXXX-4521",
    pan: "ABCPV1234K",
    gst: "29ABCPV1234K1Z5",
    aadhaarDoc: "aadhaar.pdf",
    panDoc: "pan.pdf",
    gstDoc: "gst.pdf",
    status: "published",
    verificationStatus: "verified",
    createdAt: "2025-11-02T08:00:00.000Z",
    updatedAt: "2026-03-15T10:30:00.000Z",
  },
];
