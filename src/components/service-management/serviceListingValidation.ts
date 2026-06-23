import type { BusinessService, PricingType } from "@/types/serviceManagement";
import { isValidImageSource, parseImageLinks } from "./imageUrlUtils";
import { validateRupeeDiscount, validateRupeePrice } from "./rupeeFormat";

export type ServiceListingFormErrors = Partial<
  Record<"name" | "category" | "description" | "image" | "gallery" | "price" | "discount", string>
>;

export function hasListingErrors(errors: ServiceListingFormErrors) {
  return Object.keys(errors).length > 0;
}

export function pricingNeedsAmount(pricingType: PricingType): boolean {
  return pricingType !== "Contact For Pricing" && pricingType !== "Quote Based";
}

function validateOptionalImage(value: string | undefined, label: string): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  if (!isValidImageSource(v)) return `Enter a valid ${label} link`;
  return undefined;
}

function validateDiscount(value: string | undefined): string | undefined {
  return validateRupeeDiscount(value);
}

function validatePrice(value: string | undefined): string | undefined {
  return validateRupeePrice(value);
}

function validateGallery(links: string[]): string | undefined {
  if (links.length === 0) return undefined;
  const invalid = links.find((l) => !isValidImageSource(l));
  if (invalid) return "One or more gallery links are invalid";
  return undefined;
}

export function validatePricingFields(service: BusinessService): Pick<ServiceListingFormErrors, "price" | "discount"> {
  const errors: Pick<ServiceListingFormErrors, "price" | "discount"> = {};
  const needsPrice = pricingNeedsAmount(service.pricingType);

  if (needsPrice && !service.price?.trim()) {
    errors.price = "Enter price in rupees (e.g. ₹5,000)";
  } else if (needsPrice && service.price?.trim()) {
    const priceErr = validatePrice(service.price);
    if (priceErr) errors.price = priceErr;
  }

  if (needsPrice) {
    const discountErr = validateDiscount(service.discount);
    if (discountErr) errors.discount = discountErr;
  }

  return errors;
}

export function validateServiceListing(
  service: BusinessService,
  mode: "draft" | "publish",
): ServiceListingFormErrors {
  const errors: ServiceListingFormErrors = {};

  if (!service.name.trim()) {
    errors.name = "Service name is required";
  }

  if (mode === "publish") {
    if (!service.category) errors.category = "Select a category";
    if (!service.description.trim()) errors.description = "Short description is required";

    const imageErr = validateOptionalImage(service.image, "cover image");
    if (imageErr) errors.image = imageErr;

    const galleryErr = validateGallery(service.gallery ?? []);
    if (galleryErr) errors.gallery = galleryErr;

    Object.assign(errors, validatePricingFields(service));
  }

  return errors;
}

export type ServiceListingTab = "information" | "pricing" | "custom-fields";

export function validateServiceListingTab(
  service: BusinessService,
  tab: ServiceListingTab,
): ServiceListingFormErrors {
  const errors: ServiceListingFormErrors = {};

  if (tab === "information") {
    if (!service.name.trim()) errors.name = "Service name is required";
    if (!service.category) errors.category = "Select a category";
    if (!service.description.trim()) errors.description = "Short description is required";

    const imageErr = validateOptionalImage(service.image, "cover image");
    if (imageErr) errors.image = imageErr;

    const galleryErr = validateGallery(service.gallery ?? []);
    if (galleryErr) errors.gallery = galleryErr;
  }

  if (tab === "pricing") {
    Object.assign(errors, validatePricingFields(service));
  }

  return errors;
}

export function validateImageLinkInput(raw: string): string | null {
  const links = parseImageLinks(raw);
  if (links.length === 0) return "Enter an image link";
  const invalid = links.find((l) => !isValidImageSource(l));
  if (invalid) return "Enter a valid image link (https://…)";
  return null;
}

export function pricePlaceholder(pricingType: PricingType): string {
  if (pricingType === "Starting From") return "₹2,000 per night";
  if (pricingType === "Fixed Price") return "₹5,000 or ₹250 per plate";
  return "Not required for this pricing type";
}
