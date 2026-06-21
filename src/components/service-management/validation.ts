import type { BusinessService, ServicePackage } from "@/types/serviceManagement";

export type ServiceFormErrors = Partial<
  Record<
    "name" | "category" | "description" | "price" | "languages" | "days" | "startDate" | "endDate" | "slots",
    string
  >
>;

export type PackageFormErrors = Partial<
  Record<"name" | "price" | "description" | "primaryServiceId", string>
>;

const NUMERIC_PRICE = /^\d+(\.\d{1,2})?$/;
const POSITIVE_INT = /^[1-9]\d*$/;

export function hasFormErrors(errors: object) {
  return Object.keys(errors).length > 0;
}

export function validateService(
  service: BusinessService,
  mode: "draft" | "publish",
): ServiceFormErrors {
  const errors: ServiceFormErrors = {};

  if (!service.name.trim()) {
    errors.name = "Service name is required";
  }

  if (mode === "publish") {
    if (!service.category) {
      errors.category = "Select a service category";
    }
    if (!service.description.trim()) {
      errors.description = "Description is required to publish";
    }
    if (service.pricingType !== "Quote Based") {
      if (!service.price?.trim()) {
        errors.price = "Enter a base price or choose Quote Based";
      } else if (!NUMERIC_PRICE.test(service.price.trim())) {
        errors.price = "Enter a valid amount (numbers only)";
      }
    }
    if (service.languages.length === 0) {
      errors.languages = "Select at least one language";
    }
    if (service.days.length === 0) {
      errors.days = "Select at least one available day";
    }
  }

  if (service.startDate && service.endDate && service.startDate > service.endDate) {
    errors.endDate = "End date must be on or after start date";
  }
  if (service.slots?.trim()) {
    if (!POSITIVE_INT.test(service.slots.trim())) {
      errors.slots = "Enter a whole number greater than 0";
    }
  }

  return errors;
}

export function validatePackage(
  pkg: ServicePackage,
  mode: "draft" | "publish",
): PackageFormErrors {
  const errors: PackageFormErrors = {};

  if (!pkg.name.trim()) {
    errors.name = "Package name is required";
  }

  if (!pkg.primaryServiceId) {
    errors.primaryServiceId = "Select the main service this package extends";
  }

  if (mode === "publish") {
    if (!pkg.price.trim()) {
      errors.price = "Price is required to publish";
    } else if (!NUMERIC_PRICE.test(pkg.price.trim())) {
      errors.price = "Enter a valid amount (numbers only)";
    }
  } else if (pkg.price.trim() && !NUMERIC_PRICE.test(pkg.price.trim())) {
    errors.price = "Enter a valid amount (numbers only)";
  }

  return errors;
}

export function emptyPackage(primaryServiceId = ""): ServicePackage {
  return {
    id: "",
    primaryServiceId,
    name: "",
    description: "",
    price: "",
    discount: "",
    validity: "",
    status: "Draft",
    updatedAt: "",
  };
}
