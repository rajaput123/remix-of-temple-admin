import type { CustomFieldType, ServiceCustomField } from "@/types/serviceManagement";

export const CUSTOM_FIELD_TYPES: CustomFieldType[] = [
  "Text",
  "Number",
  "Date",
  "Dropdown",
  "Multi Select",
  "Checkbox",
  "Text Area",
];

export function customFieldNeedsOptions(type: CustomFieldType): boolean {
  return type === "Dropdown" || type === "Multi Select";
}

export function normalizeCustomFieldType(type: string | undefined): CustomFieldType {
  if (type && CUSTOM_FIELD_TYPES.includes(type as CustomFieldType)) {
    return type as CustomFieldType;
  }
  return "Text";
}

export function normalizeCustomField(raw: ServiceCustomField): ServiceCustomField {
  const type = normalizeCustomFieldType(raw.type);
  const needsOptions = customFieldNeedsOptions(type);
  const options = needsOptions ? (raw.options ?? []).map((o) => o.trim()).filter(Boolean) : undefined;

  return {
    ...raw,
    name: raw.name?.trim() ?? "",
    type,
    required: Boolean(raw.required),
    options,
  };
}

export function validateCustomFieldDraft(field: ServiceCustomField): {
  name?: string;
  options?: string;
} {
  const errors: { name?: string; options?: string } = {};

  if (!field.name.trim()) {
    errors.name = "Field name is required";
  }

  if (customFieldNeedsOptions(field.type)) {
    const options = (field.options ?? []).map((o) => o.trim()).filter(Boolean);
    if (options.length === 0) {
      errors.options = "Add at least one option for this field type";
    } else if (options.length < 2 && field.type === "Multi Select") {
      errors.options = "Multi Select needs at least 2 options";
    }
  }

  return errors;
}
