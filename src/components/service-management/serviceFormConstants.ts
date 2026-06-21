import type { BusinessService } from "@/types/serviceManagement";

type BookingKey = keyof BusinessService["booking"];

export const BOOKING_SETTING_OPTIONS: {
  key: BookingKey;
  label: string;
  description: string;
  whenEnabled: string;
}[] = [
  {
    key: "allowEnquiries",
    label: "Allow enquiries",
    description: "Let devotees ask questions before they commit.",
    whenEnabled: "An enquiry button shows on the listing; you receive messages in your queue.",
  },
  {
    key: "allowConsultation",
    label: "Allow consultation",
    description: "Offer a call or visit to discuss details first.",
    whenEnabled: "Devotees can request a consultation slot before booking.",
  },
  {
    key: "allowDirectBooking",
    label: "Allow direct booking",
    description: "Let devotees pick a date and book immediately.",
    whenEnabled: "Calendar booking is available without an enquiry step.",
  },
  {
    key: "requireApproval",
    label: "Require approval",
    description: "You review each request before it is confirmed.",
    whenEnabled: "Bookings stay pending until you approve or reject them.",
  },
];

export const COVERAGE_OPTIONS: {
  value: BusinessService["coverage"];
  label: string;
  hint: string;
}[] = [
  { value: "Local", label: "Local", hint: "One city or town" },
  { value: "District", label: "District", hint: "Entire district" },
  { value: "Statewide", label: "Statewide", hint: "Anywhere in the state" },
  { value: "Nationwide", label: "Nationwide", hint: "All of India" },
];

export function parseRequirementBullets(text: string): string[] {
  if (!text.trim()) return [""];
  return text.split("\n").map((line) => line.replace(/^[-•*]\s*/, "").trim());
}

export function serializeRequirementBullets(items: string[]): string {
  return items.map((s) => s.trim()).filter(Boolean).join("\n");
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function readImageFilesAsDataUrls(files: FileList | File[]): Promise<string[]> {
  const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
  return Promise.all(list.map(readFileAsDataUrl));
}
