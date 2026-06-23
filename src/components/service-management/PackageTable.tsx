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
  AiInsightBanner,
  FilterSelectionActions,
  FilterStrip,
  WorkspaceTable,
  type WorkspaceColumnDef,
} from "@/components/workspace";
import { WORKSPACE_PAGE_SIZE } from "@/components/workspace/tablePagination";
import type { BusinessService, ServicePackage } from "@/types/serviceManagement";
import { cn } from "@/lib/utils";
import { StatusDotBadge } from "./StatusBadges";
import { formatAge, formatPackageId, packageCombinedPriceValue, packagePriceParts } from "./shared";

function stopRowActivation(e: SyntheticEvent) {
  e.stopPropagation();
}

function isCheckboxInteraction(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("[data-checkbox-cell]") || target.closest('[role="checkbox"]'));
}

type SortDir = "asc" | "desc";

type SortKey = "name" | "primary" | "price" | "status" | "updatedAt";

interface PackageTableProps {
  packages: ServicePackage[];
  services: BusinessService[];
  onEdit: (pkg: ServicePackage) => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkActivate?: (ids: string[]) => void;
  onFilterDrafts?: () => void;
  draftHighlight?: { count: number; label: string };
  emptyAction?: React.ReactNode;
}

function queueStatusLabel(status: ServicePackage["status"]) {
  if (status === "Draft") return "Pending";
  if (status === "Inactive") return "In review";
  return status;
}

function subjectSecondary(pkg: ServicePackage) {
  const desc = pkg.description?.slice(0, 56);
  return desc ? `${desc}${pkg.description.length > 56 ? "…" : ""}` : "Tier for main service";
}

export function PackageTable({
  packages,
  services,
  onEdit,
  onBulkDelete,
  onBulkActivate,
  onFilterDrafts,
  draftHighlight,
  emptyAction,
}: PackageTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [mainServiceFilter, setMainServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [savedView, setSavedView] = useState("queue");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const serviceNameById = useMemo(
    () => new Map(services.map((s) => [s.id, s.name])),
    [services],
  );

  const serviceById = useMemo(
    () => new Map(services.map((s) => [s.id, s])),
    [services],
  );

  const filtered = useMemo(() => {
    let rows = packages.filter((p) => {
      const main =
        mainServiceFilter === "all" || p.primaryServiceId === mainServiceFilter;
      const st = statusFilter === "all" || p.status === statusFilter;
      const view =
        savedView === "all" ||
        savedView === "queue" ||
        (savedView === "drafts" && p.status === "Draft") ||
        (savedView === "active" && p.status === "Active");
      return main && st && view;
    });

    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = (a.name || "").localeCompare(b.name || "");
          break;
        case "primary":
          cmp = (serviceNameById.get(a.primaryServiceId) ?? "").localeCompare(
            serviceNameById.get(b.primaryServiceId) ?? "",
          );
          break;
        case "price":
          cmp =
            packageCombinedPriceValue(a, serviceById.get(a.primaryServiceId)) -
            packageCombinedPriceValue(b, serviceById.get(b.primaryServiceId));
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
  }, [packages, mainServiceFilter, statusFilter, savedView, sortKey, sortDir, serviceNameById, serviceById]);

  const { items: paged, totalPages, currentPage, rangeStart, rangeEnd, total } = paginate(
    filtered,
    page,
    WORKSPACE_PAGE_SIZE,
  );

  const selectedDraftIds = [...selected].filter(
    (id) => packages.find((p) => p.id === id)?.status === "Draft",
  );
  const selectedIds = [...selected];
  const singleSelected = selectedIds.length === 1 ? packages.find((p) => p.id === selectedIds[0]) : undefined;

  const clearSelection = () => setSelected(new Set());

  const columns: WorkspaceColumnDef<ServicePackage>[] = [
    {
      id: "id",
      header: (
        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">ID</span>
      ),
      colStyle: { width: "5.5rem" },
      className: "max-w-[5.5rem] overflow-hidden text-left",
      cell: (pkg) => (
        <button
          type="button"
          className="block max-w-full truncate font-mono text-[11px] text-primary hover:underline"
          title={pkg.id}
          onClick={(e) => {
            e.stopPropagation();
            openRow(pkg);
          }}
        >
          {formatPackageId(pkg.id)}
        </button>
      )
    },
    {
      id: "name",
      header: <SortHead label="Package" col="name" />,
      colStyle: { width: "26%" },
      className: "max-w-0 overflow-hidden text-left",
      cell: (pkg) => (
        <div
          className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5"
          title={`${pkg.name}${pkg.description ? ` · ${pkg.description}` : ""}`}
        >
          <p className="cell-primary shrink-0">{pkg.name || "—"}</p>
        </div>
      )
    },
    {
      id: "primary",
      header: <SortHead label="Primary Service" col="primary" />,
      colStyle: { width: "26%" },
      className: "max-w-0 overflow-hidden text-left",
      cell: (pkg) => {
        const name = serviceNameById.get(pkg.primaryServiceId) ?? "—";
        return (
          <span className="block truncate text-sm text-muted-foreground" title={name}>
            {name}
          </span>
        );
      }
    },
    {
      id: "price",
      header: <SortHead label="Price" col="price" align="right" />,
      colStyle: { width: "12rem" },
      headerClassName: "text-right",
      className: "overflow-hidden text-right",
      cell: (pkg) => {
        const { formattedCombined, parts } = packagePriceParts(pkg, serviceById.get(pkg.primaryServiceId));
        return (
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-1.5 gap-y-0.5">
            <p className="font-mono text-xs tabular-nums text-foreground">{formattedCombined}</p>
            {parts && (
              <span
                className="truncate font-mono text-[10px] tabular-nums text-muted-foreground"
                title={parts}
              >
                · {parts}
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
      cell: (pkg) => (
        <StatusDotBadge status={pkg.status} label={queueStatusLabel(pkg.status)} />
      )
    },
    {
      id: "updatedAt",
      header: <SortHead label="Updated" col="updatedAt" />,
      colStyle: { width: "4.5rem" },
      className: "whitespace-nowrap text-left font-mono text-[11px] tabular-nums text-muted-foreground",
      cell: (pkg) => formatAge(pkg.updatedAt)
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

  const openRow = (pkg: ServicePackage) => onEdit(pkg);

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
          {draftHighlight.count} draft package{draftHighlight.count > 1 ? "s" : ""} awaiting publish.{" "}
          <span className="font-medium">{draftHighlight.label}</span> may delay tier bookings. Consider batch publish
          to go live.
        </AiInsightBanner>
      )}

      <FilterStrip>
        <Select value={mainServiceFilter} onValueChange={(v) => { setMainServiceFilter(v); setPage(1); }}>
          <SelectTrigger className="h-7 w-auto min-w-[148px] gap-1.5 px-2.5 text-xs shadow-none [&>svg:last-child]:hidden">
            <Layers className="size-3.5 shrink-0 text-muted-foreground" />
            Main service
            <SelectValue placeholder="All" />
            <ChevronDown className="size-3 text-muted-foreground" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
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
        emptyTitle="No packages match your filters"
        emptyDescription="Try adjusting main service, priority, or saved view."
        emptyAction={emptyAction}
        minWidth="min-w-[1024px]"
        ariaLabel="Packages table"
      />
    </div>
  );
}
