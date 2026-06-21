import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import {
  ArrowUpDown,
  Bookmark,
  CheckCheck,
  ChevronDown,
  Inbox,
  Layers,
  Pencil,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { SERVICE_CATEGORIES } from "@/types/serviceManagement";
import { cn } from "@/lib/utils";
import { AvailabilityDotBadge, StatusDotBadge } from "./StatusBadges";
import { formatAge, formatPrice, formatServiceId } from "./shared";

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
}

function queueStatusLabel(status: BusinessService["status"]) {
  if (status === "Draft") return "Pending";
  if (status === "Inactive") return "In review";
  return status;
}

function locationLabel(service: BusinessService) {
  return service.city || service.subcategory || "—";
}

function subjectSecondary(service: BusinessService) {
  return service.subcategory || service.city || service.category;
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
}: ServiceTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [savedView, setSavedView] = useState("queue");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    let rows = services.filter((s) => {
      const cat = categoryFilter === "all" || s.category === categoryFilter;
      const st = statusFilter === "all" || s.status === statusFilter;
      const view =
        savedView === "all" ||
        savedView === "queue" ||
        (savedView === "drafts" && s.status === "Draft") ||
        (savedView === "active" && s.status === "Active");
      return cat && st && view;
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
          cmp = Number(a.price || 0) - Number(b.price || 0);
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
  }, [services, categoryFilter, statusFilter, savedView, sortKey, sortDir]);

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
    align = "left",
  }: {
    label: string;
    col: SortKey;
    align?: "left" | "right";
  }) => (
    <button
      type="button"
      onClick={() => toggleSort(col)}
      aria-sort={sortAria(col)}
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-foreground transition-colors duration-[120ms] hover:text-primary",
        align === "right" && "flex-row-reverse",
      )}
    >
      {label}
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
            setSavedView("drafts");
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
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="h-7 w-auto min-w-[132px] gap-1.5 px-2.5 text-xs shadow-none [&>svg:last-child]:hidden">
            <Layers className="size-3.5 shrink-0 text-muted-foreground" />
            Category
            <SelectValue placeholder="All" />
            <ChevronDown className="size-3 text-muted-foreground" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {SERVICE_CATEGORIES.map((c) => (
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

        <Select value={savedView} onValueChange={(v) => { setSavedView(v); setPage(1); }}>
          <SelectTrigger className="h-7 w-auto min-w-[148px] gap-1.5 px-2.5 text-xs shadow-none [&>svg:last-child]:hidden">
            <Bookmark className="size-3.5 shrink-0 text-muted-foreground" />
            Saved view
            <SelectValue placeholder="My queue" />
            <ChevronDown className="size-3 text-muted-foreground" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="queue">My queue</SelectItem>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="drafts">Drafts</SelectItem>
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
      </FilterStrip>

      <div className="flex flex-col overflow-hidden" role="region" aria-label="Services table">
        <Table variant="workspace" container={false} className="table-workspace min-w-[960px]">
          <colgroup>
            <col style={{ width: "2.5rem" }} />
            <col style={{ width: "4.5rem" }} />
            <col />
            <col style={{ width: "13%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "6.5rem" }} />
            <col style={{ width: "7.5rem" }} />
            <col style={{ width: "6.5rem" }} />
            <col style={{ width: "4.5rem" }} />
          </colgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-center">
                <Checkbox checked={allPageSelected} onCheckedChange={toggleAll} aria-label="Select all rows" />
              </TableHead>
              <TableHead className="text-left">ID</TableHead>
              <TableHead className="text-left">
                <SortHead label="Service" col="name" />
              </TableHead>
              <TableHead className="hidden text-left md:table-cell">
                <SortHead label="Category" col="category" />
              </TableHead>
              <TableHead className="hidden text-left lg:table-cell">Location</TableHead>
              <TableHead className="text-right">
                <div className="flex justify-end">
                  <SortHead label="Price" col="price" align="right" />
                </div>
              </TableHead>
              <TableHead className="hidden text-left sm:table-cell">Availability</TableHead>
              <TableHead className="text-left">
                <SortHead label="Status" col="status" />
              </TableHead>
              <TableHead className="text-right">
                <div className="flex justify-end">
                  <SortHead label="Updated" col="updatedAt" align="right" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9} className="p-0">
                  <div className="py-16 text-center">
                    <Inbox className="mx-auto size-8 text-muted-foreground/40" aria-hidden />
                    <p className="mt-3 text-sm font-medium text-foreground">No services match your filters</p>
                    <p className="mt-1 text-xs text-muted-foreground">Try adjusting category, status, or saved view.</p>
                    {emptyAction && <div className="mt-4">{emptyAction}</div>}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paged.map((service) => {
                const isSelected = selected.has(service.id);
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
                    <TableCell className="whitespace-nowrap text-left">
                      <button
                        type="button"
                        className="font-mono text-[11px] text-primary hover:underline"
                        title={service.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openRow(service);
                        }}
                      >
                        {formatServiceId(service.id)}
                      </button>
                    </TableCell>
                    <TableCell className="min-w-0 text-left">
                      <div className="min-w-0 space-y-0.5" title={`${service.name} · ${subjectSecondary(service)}`}>
                        <p className="cell-primary">{service.name}</p>
                        <p className="cell-secondary">{subjectSecondary(service)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden min-w-0 text-left md:table-cell">
                      <span className="block truncate text-muted-foreground" title={service.category}>
                        {service.category}
                      </span>
                    </TableCell>
                    <TableCell className="hidden min-w-0 text-left lg:table-cell">
                      <span className="block truncate text-muted-foreground" title={locationLabel(service)}>
                        {locationLabel(service)}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-mono text-xs tabular-nums">
                      {formatPrice(service)}
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-left sm:table-cell">
                      <AvailabilityDotBadge availability={service.availability} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-left">
                      <StatusDotBadge status={service.status} label={queueStatusLabel(service.status)} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-mono text-[11px] tabular-nums text-muted-foreground">
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
