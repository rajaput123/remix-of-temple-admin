import { useMemo, useState } from "react";
import {
  CheckCheck,
  Layers,
  Pencil,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  FilterStrip,
  WorkspaceTable,
  type WorkspaceColumnDef,
} from "@/components/workspace";
import { WORKSPACE_PAGE_SIZE } from "@/components/workspace/tablePagination";
import type { BusinessService } from "@/types/serviceManagement";
import { SERVICE_LISTING_CATEGORIES } from "@/types/serviceManagement";
import { StatusDotBadge } from "./StatusBadges";
import { formatAge, formatPrice, formatPriceSub, formatServiceId } from "./shared";

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q);
      const cat = categoryFilter === "all" || s.category === categoryFilter;
      const st = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && cat && st;
    });
  }, [services, search, categoryFilter, statusFilter]);

  const selectedDraftIds = [...selected].filter((id) => services.find((s) => s.id === id)?.status === "Draft");
  const selectedIds = [...selected];
  const singleSelected = selectedIds.length === 1 ? services.find((s) => s.id === selectedIds[0]) : undefined;

  const columns: WorkspaceColumnDef<BusinessService>[] = [
    {
      id: "id",
      header: (
        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">ID</span>
      ),
      colStyle: { width: "5.5rem" },
      className: "max-w-[5.5rem] overflow-hidden text-left",
      cell: (service) => (
        <span className="block max-w-full truncate font-mono text-[11px] text-primary" title={service.id}>
          {formatServiceId(service.id)}
        </span>
      ),
    },
    {
      id: "name",
      header: "Service",
      colStyle: { width: "32%" },
      className: "text-left max-w-0 overflow-hidden",
      cell: (service) => (
        <div className="min-w-0 space-y-0.5">
          <p className="cell-primary font-medium">{service.name || "—"}</p>
          {service.description?.trim() && (
            <p className="cell-secondary truncate">{service.description.trim()}</p>
          )}
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      colStyle: { width: "18%" },
      className: "max-w-0 overflow-hidden text-left",
      cell: (service) => (
        <span className="block w-full truncate text-sm text-muted-foreground" title={service.category || undefined}>
          {service.category || "—"}
        </span>
      ),
    },
    {
      id: "price",
      header: "Price",
      colStyle: { width: "9rem" },
      headerClassName: "text-right",
      className: "text-right",
      cell: (service) => {
        const priceSub = formatPriceSub(service);
        return (
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-xs font-semibold text-foreground">{formatPrice(service)}</span>
            {priceSub && <span className="text-[10px] text-muted-foreground">{priceSub}</span>}
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      colStyle: { width: "8rem" },
      className: "whitespace-nowrap text-left",
      cell: (service) => (
        <StatusDotBadge status={service.status} label={queueStatusLabel(service.status)} />
      ),
    },
    {
      id: "updatedAt",
      header: "Updated",
      colStyle: { width: "5rem" },
      className: "whitespace-nowrap text-left font-mono text-[11px] tabular-nums text-muted-foreground",
      cell: (service) => formatAge(service.updatedAt),
    },
  ];

  const handleBulkDelete = () => {
    onBulkDelete?.(selectedIds);
    setSelected(new Set());
  };

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
          <span className="font-medium">{draftHighlight.label}</span> may delay booking enquiries. Consider batch
          publish to go live.
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
            className="h-7 pl-8 text-xs"
          />
        </div>

        <Select
          value={categoryFilter}
          onValueChange={(val) => {
            setCategoryFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-7 w-auto min-w-[150px] text-xs">
            <Layers className="mr-1.5 size-3.5 text-muted-foreground" />
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {SERVICE_LISTING_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-7 w-auto min-w-[150px] text-xs">
            <SlidersHorizontal className="mr-1.5 size-3.5 text-muted-foreground" />
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {selected.size === 1 && singleSelected && (
          <div className="flex items-center gap-1.5">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 text-xs text-foreground"
                onClick={() => onEdit(singleSelected)}
              >
                <Pencil className="size-3.5" />
                Edit Selected
              </Button>
            )}
            {onBulkDelete && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={handleBulkDelete}
              >
                <Trash2 className="size-3.5" />
                Delete Selected
              </Button>
            )}
          </div>
        )}

        {selected.size > 1 && (
          <div className="flex items-center gap-1.5">
            {onBulkDelete && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={handleBulkDelete}
              >
                <Trash2 className="size-3.5" />
                Delete selected ({selected.size})
              </Button>
            )}
            {onBulkActivate && selectedDraftIds.length > 0 && (
              <Button
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={() => {
                  onBulkActivate(selectedDraftIds);
                  setSelected(new Set());
                }}
              >
                <CheckCheck className="size-3.5" />
                Batch publish ({selectedDraftIds.length})
              </Button>
            )}
          </div>
        )}

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
        onRowClick={onView}
        emptyTitle="No services match your filters"
        emptyDescription="Try adjusting category or status."
        emptyAction={emptyAction}
        minWidth="min-w-[800px]"
        ariaLabel="Services table"
      />
    </div>
  );
}
