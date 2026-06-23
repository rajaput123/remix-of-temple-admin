import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { ArrowUpDown, Calendar, ChevronDown, Inbox, Layers, Receipt, X } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterStrip, TablePaginationFooter } from "@/components/workspace";
import { paginate, WORKSPACE_PAGE_SIZE } from "@/components/workspace/tablePagination";
import type { ServiceBooking } from "@/types/serviceBooking";
import { SERVICE_CATEGORIES } from "@/types/serviceManagement";
import { cn } from "@/lib/utils";
import { OnlineBookingDetailSheet } from "./OnlineBookingDetailSheet";
import {
  formatBookingAmount,
  formatBookingDate,
  formatBookingId,
  formatPaymentMode,
  formatPaymentRef,
} from "./bookingFormat";
import { downloadBookingReceipt, formatBookingReceiptNo } from "./bookingReceiptUtils";

type SortDir = "asc" | "desc";
type SortKey =
  | "id"
  | "serviceName"
  | "customerName"
  | "scheduledDate"
  | "amount"
  | "paymentMode"
  | "referenceNo"
  | "receiptNo";

function stopRowActivation(e: SyntheticEvent) {
  e.stopPropagation();
}

interface OnlineBookingTableProps {
  bookings: ServiceBooking[];
}

export function OnlineBookingTable({ bookings }: OnlineBookingTableProps) {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("scheduledDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<ServiceBooking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = (booking: ServiceBooking) => {
    setSelected(booking);
    setDetailOpen(true);
  };

  const filtered = useMemo(() => {
    let rows = bookings.filter((b) => {
      const cat = categoryFilter === "all" || b.category === categoryFilter;
      const fromOk = !fromDate || b.scheduledDate >= fromDate;
      const toOk = !toDate || b.scheduledDate <= toDate;
      return cat && fromOk && toOk;
    });

    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "id":
          cmp = formatBookingId(a.id).localeCompare(formatBookingId(b.id));
          break;
        case "serviceName":
          cmp = a.serviceName.localeCompare(b.serviceName);
          break;
        case "customerName":
          cmp = a.customerName.localeCompare(b.customerName);
          break;
        case "scheduledDate":
          cmp = new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
          break;
        case "amount":
          cmp = a.amount - b.amount;
          break;
        case "paymentMode":
          cmp = formatPaymentMode(a).localeCompare(formatPaymentMode(b));
          break;
        case "referenceNo":
          cmp = (formatPaymentRef(a) ?? "").localeCompare(formatPaymentRef(b) ?? "");
          break;
        case "receiptNo":
          cmp = formatBookingReceiptNo(a).localeCompare(formatBookingReceiptNo(b));
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [bookings, categoryFilter, fromDate, toDate, sortKey, sortDir]);

  const hasDateFilter = Boolean(fromDate || toDate);

  const clearDateFilter = () => {
    setFromDate("");
    setToDate("");
    setPage(1);
  };

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

  return (
    <>
      <div className="flex flex-col">
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

          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              className="h-7 w-[132px] px-2.5 text-xs shadow-none"
              aria-label="Scheduled from date"
            />
            <span className="text-xs text-muted-foreground">–</span>
            <Input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              className="h-7 w-[132px] px-2.5 text-xs shadow-none"
              aria-label="Scheduled to date"
            />
            {hasDateFilter && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={clearDateFilter}
              >
                <X className="size-3.5" />
                Clear
              </Button>
            )}
          </div>
        </FilterStrip>

        <div className="overflow-x-auto" role="region" aria-label="Online bookings table">
          <Table variant="workspace" container={false} className="table-workspace min-w-[980px]">
            <colgroup>
              <col style={{ width: "5.5rem" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "6.75rem" }} />
              <col style={{ width: "5.25rem" }} />
              <col style={{ width: "7rem" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "7.5rem" }} />
            </colgroup>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-left">
                  <SortHead label="Booking ID" col="id" />
                </TableHead>
                <TableHead className="text-left">
                  <SortHead label="Service Name" col="serviceName" />
                </TableHead>
                <TableHead className="text-left">
                  <SortHead label="Customer Name" col="customerName" />
                </TableHead>
                <TableHead className="text-left">
                  <SortHead label="Scheduled On" col="scheduledDate" />
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex justify-end">
                    <SortHead label="Amount" col="amount" align="right" />
                  </div>
                </TableHead>
                <TableHead className="text-left">
                  <SortHead label="Payment Mode" col="paymentMode" />
                </TableHead>
                <TableHead className="text-left">
                  <SortHead label="Payment Ref" col="referenceNo" />
                </TableHead>
                <TableHead className="text-left">
                  <SortHead label="Receipt No" col="receiptNo" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="p-0">
                    <div className="py-16 text-center">
                      <Inbox className="mx-auto size-8 text-muted-foreground/40" aria-hidden />
                      <p className="mt-3 text-sm font-medium text-foreground">No online bookings match your filters</p>
                      <p className="mt-1 text-xs text-muted-foreground">Try adjusting category or scheduled date range.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((booking) => {
                  const receiptNo = formatBookingReceiptNo(booking);
                  const paymentRef = formatPaymentRef(booking);
                  return (
                    <TableRow
                      key={booking.id}
                      tabIndex={0}
                      className="group cursor-pointer"
                      onClick={() => openDetail(booking)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          openDetail(booking);
                        }
                      }}
                    >
                      <TableCell className="whitespace-nowrap text-left">
                        <span className="font-mono text-[11px] text-primary" title={booking.id}>
                          {formatBookingId(booking.id)}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-0 text-left">
                        <div className="min-w-0 space-y-0.5" title={booking.serviceName}>
                          <p className="cell-primary">{booking.serviceName}</p>
                          <p className="cell-secondary">{booking.category}</p>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-0 text-left">
                        <div className="min-w-0 space-y-0.5">
                          <p className="cell-primary">{booking.customerName}</p>
                          <p className="cell-secondary">{booking.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-left">
                        <p className="cell-primary">{formatBookingDate(booking.scheduledDate)}</p>
                        <p className="cell-secondary">{booking.scheduledTime}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right font-mono text-xs tabular-nums">
                        {formatBookingAmount(booking.amount)}
                      </TableCell>
                      <TableCell className="min-w-0 text-left">
                        <p className="cell-primary">{formatPaymentMode(booking)}</p>
                        <p className="cell-secondary">{booking.paymentMethod}</p>
                      </TableCell>
                      <TableCell className="min-w-0 text-left">
                        {paymentRef ? (
                          <p className="truncate font-mono text-[11px] text-foreground" title={paymentRef}>
                            {paymentRef}
                          </p>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-left" onClick={stopRowActivation}>
                        <Button
                          variant="link"
                          size="sm"
                          className="inline-flex h-auto max-w-none shrink-0 whitespace-nowrap p-0 font-mono text-[11px] text-primary hover:underline"
                          title={receiptNo}
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadBookingReceipt(booking);
                          }}
                        >
                          <Receipt className="mr-1 size-3 shrink-0" />
                          <span className="whitespace-nowrap">{receiptNo}</span>
                        </Button>
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

      <OnlineBookingDetailSheet
        booking={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
