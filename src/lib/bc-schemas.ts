import { z } from "zod";

export const authSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit OTP"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

export const businessTypeSchema = z.object({
  category: z.string().min(1, "Choose a category"),
  subcategory: z.string().optional(),
});

export const infoSchema = z.object({
  name: z.string().trim().min(2, "Business name is required").max(120),
  legalName: z.string().max(160).optional().or(z.literal("")),
  description: z.string().max(1000).optional().or(z.literal("")),
  ownerName: z.string().trim().min(2, "Owner name is required").max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile"),
  whatsapp: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit number")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Invalid email"),
  experience: z.string().max(40).optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  gst: z.string().max(20).optional().or(z.literal("")),
});

export const locationSchema = z.object({
  line1: z.string().trim().min(3, "Address is required").max(200),
  line2: z.string().max(200).optional().or(z.literal("")),
  landmark: z.string().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2, "City is required").max(80),
  district: z.string().trim().min(2, "District is required").max(80),
  state: z.string().trim().min(2, "State is required").max(80),
  country: z.string().trim().min(2, "Country is required").max(80),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  lat: z.string().optional().or(z.literal("")),
  lng: z.string().optional().or(z.literal("")),
  reach: z.enum(["local", "district", "statewide", "nationwide"]),
});

export const commsSchema = z.object({
  languages: z.array(z.string()).min(1, "Select at least one language"),
  channels: z.array(z.string()).min(1, "Select at least one channel"),
});
