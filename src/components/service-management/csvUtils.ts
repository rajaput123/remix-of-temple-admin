import type { BusinessService, ServicePackage, ServiceStatus } from "@/types/serviceManagement";
import { SERVICE_CATEGORIES } from "@/types/serviceManagement";
import { emptyService } from "@/stores/serviceManagementStore";

export function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

export function parseCsv(text: string): string[][] {
  return text
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map(splitCsvLine);
}

const SERVICE_EXPORT_HEADERS = [
  "name",
  "category",
  "subcategory",
  "description",
  "status",
  "pricingType",
  "price",
  "discount",
  "currency",
  "startDate",
  "endDate",
  "slots",
  "city",
  "state",
  "availability",
] as const;

export function exportServicesCsv(services: BusinessService[]) {
  const header = SERVICE_EXPORT_HEADERS.join(",");
  const rows = services.map((s) =>
    SERVICE_EXPORT_HEADERS.map((key) => escapeCsvCell(String(s[key] ?? ""))).join(","),
  );
  downloadCsv(`services-export-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows].join("\n"));
}

export function serviceImportTemplateCsv() {
  const sample: BusinessService = {
    ...emptyService(),
    name: "Gruhapravesha Pooja",
    category: "Priest Services",
    subcategory: "Gruhapravesha",
    description: "Complete pooja with homa and vastu rituals.",
    status: "Draft",
    pricingType: "Fixed Price",
    price: "5000",
    discount: "5%",
    currency: "INR",
    startDate: "2026-04-01",
    endDate: "2026-12-31",
    slots: "12",
    city: "Mangalore",
    state: "Karnataka",
    availability: "Available",
  };
  const header = SERVICE_EXPORT_HEADERS.join(",");
  const row = SERVICE_EXPORT_HEADERS.map((key) => escapeCsvCell(String(sample[key] ?? ""))).join(",");
  downloadCsv("services-import-template.csv", `${header}\n${row}`);
}

export interface ParsedServiceRow {
  index: number;
  data: Partial<BusinessService>;
  errors: string[];
}

export function parseServiceImportRows(rows: string[][]): ParsedServiceRow[] {
  if (rows.length === 0) return [];
  const [headerRow, ...body] = rows;
  const headers = headerRow.map((h) => h.toLowerCase().replace(/\s+/g, ""));

  const idx = (name: string) => headers.indexOf(name);

  return body.map((cells, i) => {
    const errors: string[] = [];
    const get = (name: string) => cells[idx(name)] ?? "";

    const name = get("name");
    const category = get("category");
    const status = get("status") as ServiceStatus;
    const pricingType = get("pricingtype") as BusinessService["pricingType"];

    if (!name.trim()) errors.push("Name is required");
    if (!category.trim()) errors.push("Category is required");
    else if (!SERVICE_CATEGORIES.includes(category as (typeof SERVICE_CATEGORIES)[number])) {
      errors.push(`Unknown category "${category}"`);
    }
    if (status && !["Draft", "Active", "Inactive"].includes(status)) {
      errors.push(`Invalid status "${status}"`);
    }

    const data: Partial<BusinessService> = {
      name: name.trim(),
      category: category.trim(),
      subcategory: get("subcategory").trim(),
      description: get("description").trim(),
      status: (status as ServiceStatus) || "Draft",
      pricingType: pricingType || "Fixed Price",
      price: get("price").trim(),
      discount: get("discount").trim(),
      currency: get("currency").trim() || "INR",
      startDate: get("startdate").trim(),
      endDate: get("enddate").trim(),
      slots: get("slots").trim(),
      city: get("city").trim(),
      state: get("state").trim(),
      availability: (get("availability") as BusinessService["availability"]) || "Available",
    };

    return { index: i + 2, data, errors };
  });
}

const PACKAGE_EXPORT_HEADERS = [
  "mainService",
  "name",
  "description",
  "price",
  "discount",
  "validity",
  "status",
] as const;

export function exportPackagesCsv(packages: ServicePackage[], services: BusinessService[]) {
  const nameById = new Map(services.map((s) => [s.id, s.name]));
  const header = PACKAGE_EXPORT_HEADERS.join(",");
  const rows = packages.map((p) => {
    const main = nameById.get(p.primaryServiceId) ?? p.primaryServiceId;
    const record: Record<(typeof PACKAGE_EXPORT_HEADERS)[number], string> = {
      mainService: main,
      name: p.name,
      description: p.description,
      price: p.price,
      discount: p.discount ?? "",
      validity: p.validity ?? "",
      status: p.status,
    };
    return PACKAGE_EXPORT_HEADERS.map((key) => escapeCsvCell(record[key])).join(",");
  });
  downloadCsv(`packages-export-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows].join("\n"));
}

export function packageImportTemplateCsv(services: BusinessService[]) {
  const mainService = services[0]?.name ?? "Gruhapravesha Pooja";
  const header = PACKAGE_EXPORT_HEADERS.join(",");
  const row = [
    mainService,
    "Complete Package",
    "Main service plus materials and consultation.",
    "12000",
    "8%",
    "Valid for 90 days",
    "Draft",
  ]
    .map(escapeCsvCell)
    .join(",");
  downloadCsv("packages-import-template.csv", `${header}\n${row}`);
}

export interface ParsedPackageRow {
  index: number;
  data: Omit<ServicePackage, "id" | "updatedAt"> & { id?: string };
  errors: string[];
}

export function parsePackageImportRows(
  rows: string[][],
  services: BusinessService[],
): ParsedPackageRow[] {
  if (rows.length === 0) return [];
  const [headerRow, ...body] = rows;
  const headers = headerRow.map((h) => h.toLowerCase().replace(/\s+/g, ""));
  const idx = (name: string) => headers.indexOf(name);
  const serviceByName = new Map(services.map((s) => [s.name.toLowerCase(), s.id]));

  return body.map((cells, i) => {
    const errors: string[] = [];
    const get = (name: string) => cells[idx(name)] ?? "";

    const name = get("name");
    const price = get("price");
    const status = get("status") as ServiceStatus;
    const mainRaw = get("mainservice") || get("primaryservice");

    if (!name.trim()) errors.push("Name is required");
    if (!price.trim()) errors.push("Price is required");
    if (!mainRaw.trim()) errors.push("Main service is required");
    if (status && !["Draft", "Active", "Inactive"].includes(status)) {
      errors.push(`Invalid status "${status}"`);
    }

    const primaryServiceId = serviceByName.get(mainRaw.trim().toLowerCase()) ?? "";
    if (mainRaw.trim() && !primaryServiceId) {
      errors.push(`Main service not found: "${mainRaw.trim()}"`);
    }

    const data = {
      name: name.trim(),
      primaryServiceId,
      description: get("description").trim(),
      price: price.trim(),
      discount: get("discount").trim(),
      validity: get("validity").trim(),
      status: (status as ServiceStatus) || "Draft",
    };

    return { index: i + 2, data, errors };
  });
}
