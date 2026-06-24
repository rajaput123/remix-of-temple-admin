import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, Globe, IndianRupee, Plus, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkspacePage, WorkspaceStatusBar } from "@/components/workspace";
import { useServiceBookings } from "@/stores/serviceBookingStore";
import type { ServiceBooking } from "@/types/serviceBooking";
import { formatBookingAmount } from "./bookingFormat";
import { BookingsWorkspaceTable } from "./BookingsWorkspaceTable";
import { CounterBookingDetailSheet } from "./counter/CounterBookingDetailSheet";

export default function BusinessBookingsToday() {
  const navigate = useNavigate();
  const allBookings = useServiceBookings();
  const todayStr = new Date().toISOString().slice(0, 10);

  const todayBookings = useMemo(
    () => allBookings.filter((b) => b.scheduledDate === todayStr),
    [allBookings, todayStr],
  );

  const [selected, setSelected] = useState<ServiceBooking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const onlineCount = todayBookings.filter((b) => b.source === "Online").length;
  const counterCount = todayBookings.filter((b) => b.source === "Counter").length;
  const totalRevenue = todayBookings.reduce((a, b) => a + b.amount, 0);
  const pendingPayments = todayBookings.filter((b) => b.paymentStatus === "Pending").length;

  const kpis = [
    { label: "Total Bookings", value: todayBookings.length.toString(), icon: CalendarCheck },
    { label: "Online", value: onlineCount.toString(), icon: Globe },
    { label: "Counter", value: counterCount.toString(), icon: Store },
    { label: "Revenue Today", value: formatBookingAmount(totalRevenue), icon: IndianRupee },
    { label: "Pending Payment", value: pendingPayments.toString(), icon: CalendarCheck },
  ];

  const openDetail = (booking: ServiceBooking) => {
    setSelected(booking);
    setDetailOpen(true);
  };

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage
        eyebrow="Booking Management"
        title="Today's Bookings"
        description={todayLabel}
        statusBar={todayBookings.length > 0 ? <WorkspaceStatusBar /> : undefined}
        actions={
          <Button
            size="sm"
            className="h-9 gap-1.5 text-xs"
            onClick={() => navigate("/business-connect/bookings/counter")}
          >
            <Plus className="size-3.5" />
            New Booking
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-3 px-4 pb-3 md:grid-cols-5">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-4">
                <kpi.icon className="mb-2 h-5 w-5 text-muted-foreground" />
                <p className="text-xl font-bold">{kpi.value}</p>
                <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <BookingsWorkspaceTable
          bookings={todayBookings}
          showSourceFilter
          scheduledMode="time"
          onRowClick={openDetail}
          emptyTitle="No bookings scheduled for today"
          emptyDescription="Create a counter booking or wait for online orders."
          ariaLabel="Today's bookings table"
        />
      </WorkspacePage>

      <CounterBookingDetailSheet booking={selected} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}
