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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AiInsightBanner,
  FilterSelectionActions,
  FilterStrip,
  TablePaginationFooter,
} from "@/components/workspace";
import { paginate, WORKSPACE_PAGE_SIZE } from "@/components/workspace/tablePagination";
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
    if (field.name.trim()) parts.push(field.name.trim());
  }
  for (const addOn of service.addOns ?? []) {
    if (addOn.name.trim()) parts.push(addOn.name.trim());
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
        s.description.toLowerCase().includes(q);
      const cat = categoryFilter === "all" || s.category === categoryFilter;
      const st = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && cat && st;
    });

    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
        case "price":
          cmp = parseServicePriceValue(a.price) - parseServicePriceValue(b.price);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "updatedAt":
          cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [services, search, categoryFilter, statusFilter, sortKey, sortDir]);

  const { items: paged, totalPages, currentPage, rangeStart, rangeEnd, total } = paginate(
    filtered,
    page,
    WORKSPACE_PAGE_SIZE,
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const allPageSelected = paged.length > 0 && paged.every((s) => selected.has(s.id));
  const selectedDraftIds = [...selected].filter((id) => services.find((s) => s.id === id)?.status === "Draft");
  const selectedIds = [...selected];
  const singleSelected = selectedIds.length === 1 ? services.find((s) => s.id === selectedIds[0]) : undefined;

  const clearSelection = () => setSelected(new Set());

  const toggleAll = () => {
    const next = new Set(selected);
    if (allPageSelected) paged.forEach((s) => next.delete(s.id));
    else paged.forEach((s) => next.add(s.id));
    setSelected(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

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
        <div className="relative min-w-[200px] flex-1">
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

      <div className="flex flex-col overflow-x-auto" role="region" aria-label="Services table">
        <Table variant="workspace" container={false} className="table-workspace min-w-[960px]">
          <colgroup>
            <col style={{ width: "2.5rem" }} />
            <col style={{ width: "5.5rem" }} />
            <col style={{ width: "26%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "10rem" }} />
            <col style={{ width: "6.5rem" }} />
            <col style={{ width: "4.5rem" }} />
          </colgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-center">
                <Checkbox checked={allPageSelected} onCheckedChange={toggleAll} aria-label="Select all rows" />
              </TableHead>
              <TableHead className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">ID</span>
              </TableHead>
              <TableHead className="text-left">
                <SortHead label="Service" col="name" />
              </TableHead>
              <TableHead className="text-left">
                <SortHead label="Category" col="category" />
              </TableHead>
              <TableHead className="text-right">
                <SortHead label="Price" col="price" />
              </TableHead>
              <TableHead className="text-left">
                <SortHead label="Status" col="status" />
              </TableHead>
              <TableHead className="text-left">
                <SortHead label="Updated" col="updatedAt" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="p-0">
                  <div className="py-16 text-center">
                    <Inbox className="mx-auto size-8 text-muted-foreground/40" aria-hidden />
                    <p className="mt-3 text-sm font-medium text-foreground">No services match your filters</p>
                    <p className="mt-1 text-xs text-muted-foreground">Try adjusting category or status.</p>
                    {emptyAction && <div className="mt-4">{emptyAction}</div>}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paged.map((service) => {
                const isSelected = selected.has(service.id);
                const isExpanded = expandedId === service.id;
                const priceSub = formatPriceSub(service);
                const fieldParts = inlineFieldParts(service);
                return (
                  <TableRow
                    key={service.id}
                    data-state={isSelected ? "selected" : undefined}
                    tabIndex={0}
                    className="group cursor-pointer"
                    onClick={(e) => {
                      if (isCheckboxInteraction(e.target)) return;
                      openRow(service);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isCheckboxInteraction(e.target)) {
                        e.preventDefault();
                        openRow(service);
                      }
                    }}
                  >
                    <TableCell
                      data-checkbox-cell
                      className="text-center"
                      onClick={stopRowActivation}
                      onMouseDown={stopRowActivation}
                      onPointerDown={stopRowActivation}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(service.id)}
                        aria-label={`Select ${service.name}`}
                      />
                    </TableCell>
                    <TableCell className="max-w-[5.5rem] overflow-hidden text-left">
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
                    </TableCell>
                    <TableCell className="max-w-0 overflow-hidden text-left">
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
                    </TableCell>
                    <TableCell className="max-w-0 overflow-hidden text-left">
                      <span className="block truncate text-sm text-muted-foreground" title={service.category || undefined}>
                        {service.category || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="overflow-hidden text-right">
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
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-left">
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
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-left font-mono text-[11px] tabular-nums text-muted-foreground">
                      {formatAge(service.updatedAt)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <TablePaginationFooter
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          total={total}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={WORKSPACE_PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
