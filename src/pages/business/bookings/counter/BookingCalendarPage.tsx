import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  SlidersHorizontal,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterStrip, WorkspacePage, WorkspaceStatusBar } from "@/components/workspace";
import { useServiceBookings } from "@/stores/serviceBookingStore";
import type { ServiceBooking, ServiceBookingSource, ServiceBookingStatus } from "@/types/serviceBooking";
import { SERVICE_CATEGORIES } from "@/types/serviceManagement";
import { formatBookingAmount, formatBookingId } from "../bookingFormat";
import { BOOKING_STATUSES } from "./counterBookingConstants";
import { CounterBookingDetailSheet } from "./CounterBookingDetailSheet";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const statusChipClass: Record<ServiceBookingStatus, string> = {
  Enquiry: "bg-info/10 text-info border-l-info",
  "Quotation Sent": "bg-warning/10 text-warning border-l-warning",
  Confirmed: "bg-success/10 text-success border-l-success",
  "In Progress": "bg-info/10 text-info border-l-info",
  Completed: "bg-muted text-muted-foreground border-l-muted-foreground",
  Cancelled: "bg-destructive/10 text-destructive border-l-destructive",
};

const sourceBorderClass: Record<ServiceBookingSource, string> = {
  Counter: "border-l-emerald-500",
  Online: "border-l-blue-500",
};

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function BookingCalendarPage() {
  const bookings = useServiceBookings();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [sourceFilter, setSourceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const src = sourceFilter === "all" || b.source === sourceFilter;
      const cat = categoryFilter === "all" || b.category === categoryFilter;
      const st = statusFilter === "all" || b.status === statusFilter;
      return src && cat && st;
    });
  }, [bookings, sourceFilter, categoryFilter, statusFilter]);

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, ServiceBooking[]>();
    for (const b of filteredBookings) {
      const list = map.get(b.scheduledDate) ?? [];
      list.push(b);
      map.set(b.scheduledDate, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    }
    return map;
  }, [filteredBookings]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: firstDay }, (_, i) => i);
  const totalCells = leadingBlanks.length + days.length;
  const trailingBlanks = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  const isToday = (day: number) =>
    currentYear === today.getFullYear() && currentMonth === today.getMonth() && day === today.getDate();

  const getBookingsForDay = (day: number) => bookingsByDate.get(toDateKey(currentYear, currentMonth, day)) ?? [];

  const monthBookingCount = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      count += getBookingsForDay(d).length;
    }
    return count;
  }, [bookingsByDate, currentMonth, currentYear, daysInMonth]);

  const selectedDayBookings = selectedDay ? getBookingsForDay(selectedDay) : [];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const goToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDay(today.getDate());
  };

  const openBooking = (booking: ServiceBooking) => {
    setSelectedBooking(booking);
    setDetailOpen(true);
  };

  const viewingCurrentMonth =
    currentYear === today.getFullYear() && currentMonth === today.getMonth();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage
        eyebrow="Booking Management"
        title="Calendar"
        description={`${monthBookingCount} booking(s) in ${MONTHS[currentMonth]} ${currentYear}`}
        statusBar={<WorkspaceStatusBar />}
        actions={
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={goToday}>
            <CalendarDays className="size-3.5" />
            Today
          </Button>
        }
      >
        <FilterStrip>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
              <Store className="mr-1.5 size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="Counter">Counter</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
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

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-7" onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[9rem] text-center text-sm font-semibold">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <Button variant="ghost" size="icon" className="size-7" onClick={nextMonth} aria-label="Next month">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </FilterStrip>

        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row">
          <div className="min-w-0 flex-1">
            <div className="overflow-hidden rounded-xl border border-border shadow-sm">
              <div className="grid grid-cols-7 bg-muted/50">
                {DAYS_OF_WEEK.map((d) => (
                  <div
                    key={d}
                    className="py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {leadingBlanks.map((i) => (
                  <div key={`blank-${i}`} className="min-h-[108px] border-t border-r border-border bg-muted/10" />
                ))}

                {days.map((day) => {
                  const dayBookings = getBookingsForDay(day);
                  const active = selectedDay === day;
                  const todayDay = isToday(day);

                  return (
                    <div
                      key={day}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setSelectedDay(day === selectedDay ? null : day);
                      }}
                      className={`min-h-[108px] cursor-pointer border-t border-r border-border p-1.5 transition-colors duration-150 ${
                        active ? "bg-primary/5 ring-1 ring-inset ring-primary/30" : "hover:bg-muted/30"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span
                          className={`flex size-6 items-center justify-center rounded-full text-xs font-medium ${
                            todayDay ? "bg-primary font-bold text-primary-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {day}
                        </span>
                        {dayBookings.length > 0 && (
                          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {dayBookings.length}
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        {dayBookings.slice(0, 3).map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openBooking(b);
                            }}
                            className={`w-full truncate rounded-md border-l-2 px-1.5 py-1 text-left text-[10px] font-medium leading-tight transition-all hover:shadow-sm ${sourceBorderClass[b.source]} ${statusChipClass[b.status]}`}
                            title={`${b.scheduledTime} · ${b.serviceName} · ${b.customerName}`}
                          >
                            <span className="block truncate">{b.scheduledTime}</span>
                            <span className="block truncate opacity-80">{b.serviceName}</span>
                          </button>
                        ))}
                        {dayBookings.length > 3 && (
                          <p className="text-center text-[10px] text-muted-foreground">+{dayBookings.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {Array.from({ length: trailingBlanks }).map((_, i) => (
                  <div key={`trail-${i}`} className="min-h-[108px] border-t border-r border-border bg-muted/10" />
                ))}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <span className="text-[11px] font-medium text-muted-foreground">Source:</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1 w-3 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-muted-foreground">Counter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1 w-3 rounded-full bg-blue-500" />
                <span className="text-[11px] text-muted-foreground">Online</span>
              </div>
            </div>
          </div>

          <div className="w-full shrink-0 lg:w-80">
            <Card className="sticky top-4 shadow-sm">
              <CardContent className="space-y-3 p-4">
                {selectedDay ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">
                        {MONTHS[currentMonth]} {selectedDay}, {currentYear}
                      </h3>
                      <Badge variant="outline" className="text-[10px]">
                        {selectedDayBookings.length} booking(s)
                      </Badge>
                    </div>

                    {selectedDayBookings.length === 0 ? (
                      <p className="py-8 text-center text-xs text-muted-foreground">No bookings on this day</p>
                    ) : (
                      <div className="max-h-[calc(100vh-18rem)] space-y-2 overflow-y-auto pr-1">
                        {selectedDayBookings.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => openBooking(b)}
                            className={`w-full rounded-lg border-l-[3px] p-3 text-left transition-all hover:shadow-md ${sourceBorderClass[b.source]} ${statusChipClass[b.status]}`}
                          >
                            <div className="mb-1 flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold leading-tight">{b.serviceName}</span>
                              <span className="shrink-0 font-mono text-[10px] text-primary">
                                {formatBookingId(b.id)}
                              </span>
                            </div>
                            <p className="text-[11px] font-medium">{b.customerName}</p>
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="size-2.5 shrink-0" />
                              {b.scheduledTime}
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <Badge variant="outline" className="h-4 text-[9px]">
                                {b.source}
                              </Badge>
                              <span className="font-mono text-[10px] font-semibold">{formatBookingAmount(b.amount)}</span>
                            </div>
                            <p className="mt-1 text-[10px] opacity-80">{b.status}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <CalendarDays className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-foreground">Select a day</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Click a date on the calendar to see scheduled bookings.
                    </p>
                    {!viewingCurrentMonth && (
                      <Button variant="link" size="sm" className="mt-2 h-auto p-0 text-xs" onClick={goToday}>
                        Jump to today
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {filteredBookings.length === 0 && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                No bookings match your filters.
              </p>
            )}
          </div>
        </div>
      </WorkspacePage>

      <CounterBookingDetailSheet booking={selectedBooking} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}
