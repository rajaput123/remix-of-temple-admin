import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import {
  ArrowUpDown,
  CheckCheck,
  ChevronDown,
  Inbox,
  Layers,
  Pencil,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AiInsightBanner,
  FilterSelectionActions,
  FilterStrip,
  WorkspaceTable,
  type WorkspaceColumnDef,
} from "@/components/workspace";
import { WORKSPACE_PAGE_SIZE } from "@/components/workspace/tablePagination";
import type { BusinessService } from "@/types/serviceManagement";
import { SERVICE_LISTING_CATEGORIES } from "@/types/serviceManagement";
import { cn } from "@/lib/utils";
import { StatusDotBadge } from "./StatusBadges";
import { formatAge, formatPrice, formatPriceSub, formatServiceId, parseServicePriceValue } from "./shared";

type SortDir = "asc" | "desc";

type SortKey = "name" | "category" | "price" | "status" | "updatedAt";

function stopRowActivation(e: SyntheticEvent) {
  e.stopPropagation();
}

function isCheckboxInteraction(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("[data-checkbox-cell]") || target.closest('[role="checkbox"]'));
}

interface ServiceTableProps {
  services: BusinessService[];
  onView: (service: BusinessService) => void;
  onEdit?: (service: BusinessService) => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkActivate?: (ids: string[]) => void;
  onFilterDrafts?: () => void;
  draftHighlight?: { count: number; label: string };
  emptyAction?: React.ReactNode;
  filterActions?: React.ReactNode;
}

function queueStatusLabel(status: BusinessService["status"]) {
  if (status === "Draft") return "Pending";
  if (status === "Inactive") return "In review";
  return status;
}

function inlineFieldParts(service: BusinessService) {
  const parts: string[] = [];
  const desc = service.description?.trim();
  if (desc) {
    parts.push(desc.length > 48 ? `${desc.slice(0, 48)}…` : desc);
  }
  for (const field of service.customFields ?? []) {
    if (field && typeof field.name === "string" && field.name.trim()) {
      parts.push(field.name.trim());
    }
  }
  for (const addOn of service.addOns ?? []) {
    if (addOn && typeof addOn.name === "string" && addOn.name.trim()) {
      parts.push(addOn.name.trim());
    }
  }
  return parts;
}

export function ServiceTable({
  services,
  onView,
  onEdit,
  onBulkDelete,
  onBulkActivate,
  onFilterDrafts,
  draftHighlight,
  emptyAction,
  filterActions,
}: ServiceTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = services.filter((s) => {
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q);
      const cat = categoryFilter === "all" || s.category === categoryFilter;
      const st = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && cat && st;
    });

    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = (a.name || "").localeCompare(b.name || "");
          break;
        case "category":
          cmp = (a.category || "").localeCompare(b.category || "");
          break;
        case "price":
          cmp = parseServicePriceValue(a.price) - parseServicePriceValue(b.price);
          break;
        case "status":
          cmp = (a.status || "").localeCompare(b.status || "");
          break;
        case "updatedAt":
          const tA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const tB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          cmp = tA - tB;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [services, search, categoryFilter, statusFilter, sortKey, sortDir]);

  const selectedDraftIds = [...selected].filter((id) => services.find((s) => s.id === id)?.status === "Draft");
  const selectedIds = [...selected];
  const singleSelected = selectedIds.length === 1 ? services.find((s) => s.id === selectedIds[0]) : undefined;

  const clearSelection = () => setSelected(new Set());

  const columns: WorkspaceColumnDef<BusinessService>[] = [
    {
      id: "id",
      header: (
        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">ID</span>
      ),
      colStyle: { width: "5.5rem" },
      className: "max-w-[5.5rem] overflow-hidden text-left",
      cell: (service) => (
        <button
          type="button"
          className="block max-w-full truncate font-mono text-[11px] text-primary hover:underline"
          title={service.id}
          onClick={(e) => {
            e.stopPropagation();
            openRow(service);
          }}
        >
          {formatServiceId(service.id)}
        </button>
      )
    },
    {
      id: "name",
      header: <SortHead label="Service" col="name" />,
      colStyle: { width: "26%" },
      className: "max-w-0 overflow-hidden text-left",
      cell: (service) => {
        const isExpanded = expandedId === service.id;
        const fieldParts = inlineFieldParts(service);
        return (
          <div
            className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5"
            title={`${service.name}${service.description ? ` · ${service.description}` : ""}`}
          >
            <p className="cell-primary shrink-0">{service.name || "—"}</p>
            {isExpanded &&
              fieldParts.map((part, i) => (
                <span
                  key={`${part}-${i}`}
                  className="inline-flex max-w-[12rem] truncate rounded border bg-muted/30 px-1.5 py-px text-[10px] text-muted-foreground"
                  title={part}
                >
                  {part}
                </span>
              ))}
          </div>
        );
      }
    },
    {
      id: "category",
      header: <SortHead label="Category" col="category" />,
      colStyle: { width: "12%" },
      className: "max-w-0 overflow-hidden text-left",
      cell: (service) => (
        <span className="block truncate text-sm text-muted-foreground" title={service.category || undefined}>
          {service.category || "—"}
        </span>
      )
    },
    {
      id: "price",
      header: <SortHead label="Price" col="price" />,
      colStyle: { width: "10rem" },
      headerClassName: "text-right",
      className: "overflow-hidden text-right",
      cell: (service) => {
        const isExpanded = expandedId === service.id;
        const priceSub = formatPriceSub(service);
        return (
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-1.5 gap-y-0.5">
            <p className="font-mono text-xs tabular-nums text-foreground">{formatPrice(service)}</p>
            {isExpanded && priceSub && (
              <span
                className="truncate font-mono text-[10px] tabular-nums text-muted-foreground"
                title={priceSub}
              >
                · {priceSub}
              </span>
            )}
          </div>
        );
      }
    },
    {
      id: "status",
      header: <SortHead label="Status" col="status" />,
      colStyle: { width: "6.5rem" },
      className: "whitespace-nowrap text-left",
      cell: (service) => {
        const isExpanded = expandedId === service.id;
        return (
          <button
            type="button"
            className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Hide" : "Show"} fields for ${service.name}`}
            onClick={(e) => {
              e.stopPropagation();
              setExpandedId((id) => (id === service.id ? null : service.id));
            }}
          >
            <StatusDotBadge status={service.status} label={queueStatusLabel(service.status)} />
          </button>
        );
      }
    },
    {
      id: "updatedAt",
      header: <SortHead label="Updated" col="updatedAt" />,
      colStyle: { width: "4.5rem" },
      className: "whitespace-nowrap text-left font-mono text-[11px] tabular-nums text-muted-foreground",
      cell: (service) => formatAge(service.updatedAt)
    }
  ];

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortAria = (key: SortKey): "ascending" | "descending" | "none" =>
    sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : "none";

  const SortHead = ({
    label,
    col,
  }: {
    label: string;
    col: SortKey;
    align?: "left" | "right";
  }) => (
    <button
      type="button"
      onClick={() => toggleSort(col)}
      aria-sort={sortAria(col)}
      className="inline-flex max-w-full items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-foreground transition-colors duration-[120ms] hover:text-primary"
    >
      <span className="truncate">{label}</span>
      <ArrowUpDown className="size-2.5 shrink-0 opacity-50" aria-hidden />
    </button>
  );

  const openRow = (service: BusinessService) => onView(service);

  return (
    <div className="flex flex-col">
      {draftHighlight && draftHighlight.count > 0 && (
        <AiInsightBanner
          label="Bottleneck detected."
          actionLabel="Review batch"
          onAction={() => {
            setStatusFilter("Draft");
            onFilterDrafts?.();
            setPage(1);
          }}
        >
          {draftHighlight.count} draft service{draftHighlight.count > 1 ? "s" : ""} awaiting publish.{" "}
          <span className="font-medium">{draftHighlight.label}</span> may delay booking enquiries. Consider batch publish
          to go live.
        </AiInsightBanner>
      )}

      <FilterStrip>
        <div className="relative w-64 shrink-0">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
             value={search}
             onChange={(e) => {
               setSearch(e.target.value);
               setPage(1);
             }}
             placeholder="Search services…"
             className="h-7 pl-8 text-xs shadow-none"
          />
        </div>

        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="h-7 w-auto min-w-[132px] gap-1.5 px-2.5 text-xs shadow-none [&>svg:last-child]:hidden">
            <Layers className="size-3.5 shrink-0 text-muted-foreground" />
            Category
            <SelectValue placeholder="All" />
            <ChevronDown className="size-3 text-muted-foreground" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {SERVICE_LISTING_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="h-7 w-auto min-w-[132px] gap-1.5 px-2.5 text-xs shadow-none [&>svg:last-child]:hidden">
            <SlidersHorizontal className="size-3.5 shrink-0 text-muted-foreground" />
            Status
            <SelectValue placeholder="Any" />
            <ChevronDown className="size-3 text-muted-foreground" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <FilterSelectionActions count={selected.size}>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-2.5 text-xs"
              disabled={selected.size !== 1 || !singleSelected}
              onClick={() => {
                if (singleSelected) {
                  onEdit(singleSelected);
                  clearSelection();
                }
              }}
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
          )}
          {onBulkDelete && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-2.5 text-xs text-destructive hover:text-destructive"
              onClick={() => {
                onBulkDelete(selectedIds);
                clearSelection();
              }}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          )}
          <Button
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-xs"
            onClick={() => {
              onBulkActivate?.(selectedDraftIds.length ? selectedDraftIds : selectedIds);
              clearSelection();
            }}
          >
            <CheckCheck className="size-3.5" />
            Batch publish
          </Button>
        </FilterSelectionActions>

        {filterActions && (
          <div className="ml-auto flex shrink-0 items-center gap-1 border-l border-border pl-2">
            {filterActions}
          </div>
        )}
      </FilterStrip>

      <WorkspaceTable
        data={filtered}
        columns={columns}
        rowIdKey="id"
        selectedIds={selected}
        onSelectionChange={setSelected}
        page={page}
        onPageChange={setPage}
        pageSize={WORKSPACE_PAGE_SIZE}
        onRowClick={openRow}
        emptyTitle="No services match your filters"
        emptyDescription="Try adjusting category or status."
        emptyAction={emptyAction}
        minWidth="min-w-[960px]"
        ariaLabel="Services table"
      />
    </div>
  );
}
