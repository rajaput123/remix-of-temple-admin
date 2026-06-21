import { useMemo, useState } from "react";
import { Check, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkspacePage } from "@/components/workspace";
import { formatServiceId } from "@/components/service-management/shared";
import {
  updateServiceBookingStatus,
  useServiceBookings,
} from "@/stores/serviceBookingStore";
import type { ServiceBookingStatus } from "@/types/serviceBooking";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TabId = "pending" | "confirmed" | "all";

const statusClass: Record<ServiceBookingStatus, string> = {
  Pending: "bg-warning/10 text-warning",
  Confirmed: "bg-success/10 text-success",
  Completed: "bg-muted text-muted-foreground",
  Cancelled: "bg-destructive/10 text-destructive",
};

export default function OnlineServiceBookings() {
  const allBookings = useServiceBookings();
  const onlineBookings = useMemo(
    () => allBookings.filter((b) => b.source === "Online"),
    [allBookings],
  );

  const [tab, setTab] = useState<TabId>("pending");

  const pendingCount = onlineBookings.filter((b) => b.status === "Pending").length;
  const confirmedCount = onlineBookings.filter((b) => b.status === "Confirmed").length;

  const filtered = useMemo(() => {
    if (tab === "pending") return onlineBookings.filter((b) => b.status === "Pending");
    if (tab === "confirmed") return onlineBookings.filter((b) => b.status === "Confirmed");
    return onlineBookings;
  }, [onlineBookings, tab]);

  const approve = (id: string) => {
    updateServiceBookingStatus(id, "Confirmed");
    toast.success("Booking approved");
  };

  const reject = (id: string) => {
    updateServiceBookingStatus(id, "Cancelled");
    toast.success("Booking rejected");
  };

  return (
    <WorkspacePage
      eyebrow="Booking Management · Online"
      title="Online Booking"
      description="Service bookings received from your website and marketplace listing."
      tabs={[
        { id: "pending", label: "Pending approval", count: pendingCount },
        { id: "confirmed", label: "Confirmed", count: confirmedCount },
        { id: "all", label: "All", count: onlineBookings.length },
      ]}
      activeTab={tab}
      onTabChange={(id) => setTab(id as TabId)}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-auto">
          <Table className="table-workspace table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[88px]">ID</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="w-[140px]">Schedule</TableHead>
                <TableHead className="w-[88px] text-right">Amount</TableHead>
                <TableHead className="w-[100px]">Payment</TableHead>
                <TableHead className="w-[96px]">Status</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-mono text-[11px] text-primary">
                    {booking.id}
                  </TableCell>
                  <TableCell>
                    <p className="cell-primary truncate">{booking.serviceName}</p>
                    <p className="cell-secondary truncate">
                      {formatServiceId(booking.serviceId)} · {booking.category}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="cell-primary truncate">{booking.customerName}</p>
                    <p className="cell-secondary truncate">{booking.customerPhone}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-foreground">{booking.scheduledDate}</p>
                    <p className="text-[11px] text-muted-foreground">{booking.scheduledTime}</p>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums">
                    ₹{booking.amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs">{booking.paymentMode}</p>
                    {booking.referenceNo && (
                      <p className="truncate font-mono text-[10px] text-muted-foreground">
                        {booking.referenceNo}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", statusClass[booking.status])}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {booking.status === "Pending" ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 px-2 text-xs"
                          onClick={() => approve(booking.id)}
                        >
                          <Check className="size-3" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-destructive"
                          onClick={() => reject(booking.id)}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center text-sm text-muted-foreground">
                    <Globe className="mx-auto mb-2 size-8 opacity-40" />
                    No online service bookings in this view.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </WorkspacePage>
  );
}
