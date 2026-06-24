import { useMemo, useState } from "react";
import { Layers, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import { FilterStrip, WorkspaceTable, type WorkspaceColumnDef } from "@/components/workspace";
import { WORKSPACE_PAGE_SIZE } from "@/components/workspace/tablePagination";
import type { ServiceBooking, ServiceBookingStatus } from "@/types/serviceBooking";
import { SERVICE_CATEGORIES } from "@/types/serviceManagement";
import {
  formatBookingAmount,
  formatBookingDate,
  formatBookingId,
  formatPaymentMode,
  formatPaymentRef,
} from "./bookingFormat";
import { BOOKING_STATUSES, bookingStatusTone, paymentStatusTone } from "./counter/counterBookingConstants";

export interface BookingTableColumnOptions {
  showSource?: boolean;
  /** When "time", scheduled column shows slot only (for today's list). */
  scheduledMode?: "datetime" | "time";
}

export function buildBookingTableColumns(
  options: BookingTableColumnOptions = {},
): WorkspaceColumnDef<ServiceBooking>[] {
  const { showSource = false, scheduledMode = "datetime" } = options;

  const cols: WorkspaceColumnDef<ServiceBooking>[] = [
    {
      id: "id",
      header: (
        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">ID</span>
      ),
      colStyle: { width: "6.5rem" },
      className: "max-w-[6.5rem] overflow-hidden text-left",
      cell: (b) => (
        <span className="block max-w-full truncate font-mono text-[11px] text-primary" title={b.id}>
          {formatBookingId(b.id)}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      colStyle: { width: "16%" },
      className: "text-left max-w-0 overflow-hidden",
      cell: (b) => (
        <div className="min-w-0 space-y-0.5">
          <p className="cell-primary font-medium">{b.customerName}</p>
          <p className="cell-secondary truncate">{b.customerPhone}</p>
        </div>
      ),
    },
    {
      id: "service",
      header: "Service",
      colStyle: { width: "22%" },
      className: "text-left max-w-0 overflow-hidden",
      cell: (b) => (
        <div className="min-w-0 space-y-0.5">
          <p className="cell-primary font-medium">{b.serviceName}</p>
          <p className="cell-secondary truncate">
            {b.listingType === "package" ? "Package · " : ""}
            {b.category}
          </p>
        </div>
      ),
    },
  ];

  if (showSource) {
    cols.push({
      id: "source",
      header: "Source",
      colStyle: { width: "5.5rem" },
      className: "text-left",
      cell: (b) => <span className="text-sm text-muted-foreground">{b.source}</span>,
    });
  }

  cols.push(
    {
      id: "scheduled",
      header: scheduledMode === "time" ? "Time" : "Scheduled",
      colStyle: { width: scheduledMode === "time" ? "5.5rem" : "8rem" },
      className: "text-left whitespace-nowrap",
      cell: (b) =>
        scheduledMode === "time" ? (
          <span className="cell-primary font-medium">{b.scheduledTime}</span>
        ) : (
          <div className="min-w-0 space-y-0.5">
            <p className="cell-primary">{formatBookingDate(b.scheduledDate)}</p>
            <p className="cell-secondary">{b.scheduledTime}</p>
          </div>
        ),
    },
    {
      id: "amount",
      header: "Amount",
      colStyle: { width: "7rem" },
      headerClassName: "text-right",
      className: "text-right",
      cell: (b) => (
        <span className="font-mono text-xs font-semibold text-foreground">{formatBookingAmount(b.amount)}</span>
      ),
    },
    {
      id: "referenceNo",
      header: "Reference ID",
      colStyle: { width: "8rem" },
      className: "max-w-0 overflow-hidden text-left",
      cell: (b) => {
        const ref = formatPaymentRef(b);
        return ref ? (
          <span className="block truncate font-mono text-[11px] text-foreground" title={ref}>
            {ref}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      colStyle: { width: "7rem" },
      className: "text-left",
      cell: (b) => <StatusPill label={b.status} tone={bookingStatusTone[b.status]} />,
    },
    {
      id: "payment",
      header: "Payment",
      colStyle: { width: "8rem" },
      className: "text-left max-w-0 overflow-hidden",
      cell: (b) => (
        <div className="min-w-0 space-y-0.5">
          {b.paymentStatus ? (
            <StatusPill label={b.paymentStatus} tone={paymentStatusTone[b.paymentStatus]} />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
          <p className="cell-secondary truncate">{formatPaymentMode(b)}</p>
        </div>
      ),
    },
  );

  return cols;
}

export interface BookingsWorkspaceTableProps {
  bookings: ServiceBooking[];
  onRowClick: (booking: ServiceBooking) => void;
  /** Lock status filter to a single value (hides status dropdown). */
  fixedStatus?: ServiceBookingStatus;
  showSourceFilter?: boolean;
  scheduledMode?: "datetime" | "time";
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  ariaLabel?: string;
  /** Hide built-in filters (parent filters bookings). */
  hideFilters?: boolean;
}

export function BookingsWorkspaceTable({
  bookings,
  onRowClick,
  fixedStatus,
  showSourceFilter = false,
  scheduledMode = "datetime",
  searchPlaceholder = "Search customer, booking, reference…",
  emptyTitle = "No bookings match your filters",
  emptyDescription = "Try adjusting search, category, source, or status.",
  ariaLabel = "Bookings table",
  hideFilters = false,
}: BookingsWorkspaceTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const effectiveStatus = fixedStatus ?? statusFilter;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchSearch =
        !q ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        b.id.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q) ||
        (b.referenceNo?.toLowerCase().includes(q) ?? false);
      const cat = categoryFilter === "all" || b.category === categoryFilter;
      const src = !showSourceFilter || sourceFilter === "all" || b.source === sourceFilter;
      const st = effectiveStatus === "all" || b.status === effectiveStatus;
      return matchSearch && cat && src && st;
    });
  }, [bookings, search, categoryFilter, sourceFilter, showSourceFilter, effectiveStatus]);

  const columns = useMemo(
    () => buildBookingTableColumns({ showSource: showSourceFilter, scheduledMode }),
    [showSourceFilter, scheduledMode],
  );

  return (
    <>
      {!hideFilters && (
        <FilterStrip>
          <div className="relative w-64 shrink-0">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
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
            <SelectTrigger className="h-7 w-auto min-w-[132px] text-xs">
              <Layers className="mr-1.5 size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {SERVICE_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showSourceFilter && (
            <Select
              value={sourceFilter}
              onValueChange={(val) => {
                setSourceFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="Counter">Counter</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
              </SelectContent>
            </Select>
          )}

          {!fixedStatus && (
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
                <SlidersHorizontal className="mr-1.5 size-3.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                {BOOKING_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FilterStrip>
      )}

      <WorkspaceTable
        data={filtered}
        columns={columns}
        rowIdKey="id"
        page={page}
        onPageChange={setPage}
        pageSize={WORKSPACE_PAGE_SIZE}
        onRowClick={onRowClick}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        minWidth="min-w-[980px]"
        ariaLabel={ariaLabel}
      />
    </>
  );
}
