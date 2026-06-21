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
          cmp = a.name.localeCompare(b.name);
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
          cmp = a.status.localeCompare(b.status);
          break;
        case "updatedAt":
          cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
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

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const allPageSelected = paged.length > 0 && paged.every((p) => selected.has(p.id));
  const selectedDraftIds = [...selected].filter(
    (id) => packages.find((p) => p.id === id)?.status === "Draft",
  );
  const selectedIds = [...selected];
  const singleSelected = selectedIds.length === 1 ? packages.find((p) => p.id === selectedIds[0]) : undefined;

  const clearSelection = () => setSelected(new Set());

  const toggleAll = () => {
    const next = new Set(selected);
    if (allPageSelected) paged.forEach((p) => next.delete(p.id));
    else paged.forEach((p) => next.add(p.id));
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

      <div className="flex flex-col overflow-x-auto" role="region" aria-label="Packages table">
        <Table variant="workspace" container={false} className="table-workspace min-w-[1024px]">
          <colgroup>
            <col style={{ width: "2.5rem" }} />
            <col style={{ width: "5.5rem" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "8.5rem" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "6.5rem" }} />
            <col style={{ width: "4.5rem" }} />
          </colgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-center">
                <Checkbox checked={allPageSelected} onCheckedChange={toggleAll} aria-label="Select all rows" />
              </TableHead>
              <TableHead className="text-left">ID</TableHead>
              <TableHead className="hidden text-left lg:table-cell">
                <SortHead label="Main service" col="primary" />
              </TableHead>
              <TableHead className="text-left">
                <SortHead label="Tier" col="name" />
              </TableHead>
              <TableHead className="text-right">
                <div className="flex justify-end">
                  <SortHead label="Price" col="price" align="right" />
                </div>
              </TableHead>
              <TableHead className="hidden text-left sm:table-cell">Validity</TableHead>
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
                <TableCell colSpan={8} className="p-0">
                  <div className="py-16 text-center">
                    <Inbox className="mx-auto size-8 text-muted-foreground/40" aria-hidden />
                    <p className="mt-3 text-sm font-medium text-foreground">No packages match your filters</p>
                    <p className="mt-1 text-xs text-muted-foreground">Try adjusting main service, priority, or saved view.</p>
                    {emptyAction && <div className="mt-4">{emptyAction}</div>}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paged.map((pkg) => {
                const isSelected = selected.has(pkg.id);
                const mainName = serviceNameById.get(pkg.primaryServiceId) ?? "—";
                const primaryService = serviceById.get(pkg.primaryServiceId);
                const price = packagePriceParts(pkg, primaryService);
                return (
                  <TableRow
                    key={pkg.id}
                    data-state={isSelected ? "selected" : undefined}
                    tabIndex={0}
                    className="group cursor-pointer"
                    onClick={(e) => {
                      if (isCheckboxInteraction(e.target)) return;
                      openRow(pkg);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isCheckboxInteraction(e.target)) {
                        e.preventDefault();
                        openRow(pkg);
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
                        onCheckedChange={() => toggleOne(pkg.id)}
                        aria-label={`Select ${pkg.name}`}
                      />
                    </TableCell>
                    <TableCell className="max-w-[5.5rem] overflow-hidden text-left">
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
                    </TableCell>
                    <TableCell className="hidden max-w-0 overflow-hidden text-left lg:table-cell">
                      <span className="block truncate text-sm text-muted-foreground" title={mainName}>
                        {mainName}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-0 overflow-hidden text-left">
                      <div
                        className="min-w-0 space-y-0.5"
                        title={`${pkg.name}${mainName !== "—" ? ` · ${mainName}` : ""} · ${subjectSecondary(pkg)}`}
                      >
                        <p className="cell-primary">{pkg.name}</p>
                        <p className="cell-secondary lg:hidden">{mainName}</p>
                        <p className="cell-secondary hidden lg:block">{subjectSecondary(pkg)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="overflow-hidden text-right">
                      <div className="min-w-0">
                        <p className="font-mono text-xs tabular-nums text-foreground">{price.main}</p>
                        {price.sub && (
                          <p className="truncate font-mono text-[10px] tabular-nums text-muted-foreground" title={price.sub}>
                            {price.sub}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden min-w-0 text-left sm:table-cell">
                      <span className="block truncate text-muted-foreground" title={pkg.validity || undefined}>
                        {pkg.validity || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-left">
                      <StatusDotBadge status={pkg.status} label={queueStatusLabel(pkg.status)} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                      {formatAge(pkg.updatedAt)}
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
