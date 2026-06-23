import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, ChevronDown, Inbox, Layers, Search, SlidersHorizontal } from "lucide-react";
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
import { StatusPill } from "@/components/ui/status-pill";
import { FilterStrip, TablePaginationFooter } from "@/components/workspace";
import { paginate, WORKSPACE_PAGE_SIZE } from "@/components/workspace/tablePagination";
import type { ServiceBooking, ServiceBookingStatus } from "@/types/serviceBooking";
import { SERVICE_CATEGORIES } from "@/types/serviceManagement";
import { cn } from "@/lib/utils";
import {
  formatBookingAmount,
  formatBookingDate,
  formatBookingId,
} from "../bookingFormat";
import {
  BOOKING_STATUSES,
  bookingStatusTone,
  paymentStatusTone,
} from "./counterBookingConstants";

type SortDir = "asc" | "desc";
type SortKey = "customerName" | "serviceName" | "scheduledDate" | "amount" | "status";

interface CounterBookingTableProps {
  bookings: ServiceBooking[];
  statusFilter?: ServiceBookingStatus | "all";
  onSelect: (booking: ServiceBooking) => void;
}

export function CounterBookingTable({ bookings, statusFilter: fixedStatus, onSelect }: CounterBookingTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("scheduledDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const effectiveStatus = fixedStatus ?? statusFilter;

  const filtered = useMemo(() => {
    let rows = bookings.filter((b) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        b.id.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q);
      const cat = categoryFilter === "all" || b.category === categoryFilter;
      const st = effectiveStatus === "all" || b.status === effectiveStatus;
      return matchSearch && cat && st;
    });

    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "customerName":
          cmp = a.customerName.localeCompare(b.customerName);
          break;
        case "serviceName":
          cmp = a.serviceName.localeCompare(b.serviceName);
          break;
        case "scheduledDate":
          cmp = new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
          break;
        case "amount":
          cmp = a.amount - b.amount;
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [bookings, search, categoryFilter, effectiveStatus, sortKey, sortDir]);

  const { items: paged, totalPages, currentPage, rangeStart, rangeEnd, total } = paginate(
    filtered,
    page,
    WORKSPACE_PAGE_SIZE,
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortHead = ({ label, col }: { label: string; col: SortKey }) => (
    <button
      type="button"
      onClick={() => toggleSort(col)}
      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-foreground hover:text-primary"
    >
      {label}
      <ArrowUpDown className="size-2.5 opacity-50" />
    </button>
  );

  return (
    <div className="flex flex-col">
      <FilterStrip>
        <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-7 pl-8 text-xs shadow-none"
            placeholder="Search customer, phone, booking…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="h-7 w-auto min-w-[132px] gap-1.5 px-2.5 text-xs shadow-none [&>svg:last-child]:hidden">
            <Layers className="size-3.5 text-muted-foreground" />
            Category
            <SelectValue />
            <ChevronDown className="size-3 text-muted-foreground" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {SERVICE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!fixedStatus && (
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="h-7 w-auto min-w-[132px] gap-1.5 px-2.5 text-xs shadow-none [&>svg:last-child]:hidden">
              <SlidersHorizontal className="size-3.5 text-muted-foreground" />
              Status
              <SelectValue />
              <ChevronDown className="size-3 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              {BOOKING_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FilterStrip>

      <div className="overflow-x-auto">
        <Table variant="workspace" container={false} className="table-workspace min-w-[920px]">
          <colgroup>
            <col style={{ width: "5.5rem" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "7rem" }} />
            <col style={{ width: "5.5rem" }} />
            <col style={{ width: "8rem" }} />
            <col style={{ width: "7rem" }} />
          </colgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Booking ID</TableHead>
              <TableHead><SortHead label="Customer" col="customerName" /></TableHead>
              <TableHead><SortHead label="Service" col="serviceName" /></TableHead>
              <TableHead><SortHead label="Scheduled" col="scheduledDate" /></TableHead>
              <TableHead className="text-right"><SortHead label="Amount" col="amount" /></TableHead>
              <TableHead><SortHead label="Status" col="status" /></TableHead>
              <TableHead>Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="p-0">
                  <div className="py-16 text-center">
                    <Inbox className="mx-auto size-8 text-muted-foreground/40" />
                    <p className="mt-3 text-sm font-medium">No counter bookings found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paged.map((b) => (
                <TableRow
                  key={b.id}
                  tabIndex={0}
                  className="cursor-pointer"
                  onClick={() => onSelect(b)}
                  onKeyDown={(e) => e.key === "Enter" && onSelect(b)}
                >
                  <TableCell>
                    <span className="font-mono text-[11px] text-primary">{formatBookingId(b.id)}</span>
                  </TableCell>
                  <TableCell className="min-w-0">
                    <p className="cell-primary">{b.customerName}</p>
                    <p className="cell-secondary">{b.customerPhone}</p>
                  </TableCell>
                  <TableCell className="min-w-0">
                    <p className="cell-primary">{b.serviceName}</p>
                    <p className="cell-secondary">
                      {b.listingType === "package" ? "Package · " : ""}
                      {b.category}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <p className="cell-primary">{formatBookingDate(b.scheduledDate)}</p>
                    <p className="cell-secondary">{b.scheduledTime}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-mono text-xs tabular-nums">
                    {formatBookingAmount(b.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusPill label={b.status} tone={bookingStatusTone[b.status]} />
                  </TableCell>
                  <TableCell>
                    {b.paymentStatus ? (
                      <StatusPill label={b.paymentStatus} tone={paymentStatusTone[b.paymentStatus]} />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
  );
}
