import { useMemo, useState } from "react";
import { Check, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkspacePage } from "@/components/workspace";
import { formatPrice, formatServiceId } from "@/components/service-management/shared";
import { useServices } from "@/stores/serviceManagementStore";
import { recordServiceBooking } from "@/stores/serviceBookingStore";
import type { BusinessService } from "@/types/serviceManagement";
import { toast } from "sonner";

const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Card"] as const;

function parseAmount(service: BusinessService): number {
  const n = Number(service.price?.replace(/[^\d.]/g, "") || 0);
  return Number.isFinite(n) ? n : 0;
}

export default function ServiceCounterBooking() {
  const services = useServices();
  const activeServices = useMemo(
    () => services.filter((s) => s.status === "Active"),
    [services],
  );

  const [serviceId, setServiceId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [paymentMode, setPaymentMode] = useState<(typeof PAYMENT_MODES)[number]>("Cash");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);

  const selected = activeServices.find((s) => s.id === serviceId);
  const amount = selected ? parseAmount(selected) : 0;

  const resetForm = () => {
    setServiceId("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setScheduledDate("");
    setScheduledTime("");
    setPaymentMode("Cash");
    setReferenceNo("");
    setNotes("");
  };

  const handleSubmit = () => {
    if (!selected) {
      toast.error("Select a service");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Customer name and phone are required");
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      toast.error("Schedule date and time are required");
      return;
    }

    let paymentMethod: "Cash" | "UPI" | "Bank" | "Online" = "Cash";
    if (paymentMode === "UPI") paymentMethod = "UPI";
    else if (paymentMode === "Bank Transfer") paymentMethod = "Bank";
    else if (paymentMode === "Card") paymentMethod = "Online";

    const booking = recordServiceBooking({
      serviceId: selected.id,
      serviceName: selected.name,
      category: selected.category,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      scheduledDate,
      scheduledTime,
      amount,
      source: "Counter",
      paymentMethod,
      paymentMode,
      referenceNo: referenceNo.trim() || undefined,
      status: "Confirmed",
      notes: notes.trim() || undefined,
    });

    setLastBookingId(booking.id);
    toast.success("Counter booking created");
    resetForm();
  };

  return (
    <WorkspacePage
      eyebrow="Booking Management · Counter"
      title="Counter Booking"
      description="Create walk-in bookings for your listed services at the counter."
    >
      <div className="grid gap-6 p-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">New booking</CardTitle>
            <CardDescription>Select a service and enter customer details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an active service" />
                </SelectTrigger>
                <SelectContent>
                  {activeServices.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} · {formatServiceId(s.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selected && (
                <p className="text-xs text-muted-foreground">
                  {selected.category} · {formatPrice(selected)} · {selected.city || "—"}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer name</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 …"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email (optional)</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@email.com"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Time</Label>
                <Input
                  id="scheduledTime"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  placeholder="e.g. 10:30 AM"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Payment mode</Label>
                <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as typeof paymentMode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_MODES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {paymentMode !== "Cash" && (
                <div className="space-y-2">
                  <Label htmlFor="referenceNo">Reference / UTR</Label>
                  <Input
                    id="referenceNo"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="Transaction reference"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions"
              />
            </div>

            <Button className="gap-2" onClick={handleSubmit}>
              <Check className="size-4" />
              Confirm counter booking
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Store className="size-4 text-primary" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {selected ? (
              <>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Service</span>
                  <span className="text-right font-medium">{selected.name}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-mono font-medium tabular-nums">
                    {amount > 0 ? `₹${amount.toLocaleString("en-IN")}` : formatPrice(selected)}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Source</span>
                  <Badge variant="secondary">Counter</Badge>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Select a service to see pricing.</p>
            )}
            {lastBookingId && (
              <div className="mt-4 rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-xs">
                Last booking:{" "}
                <span className="font-mono font-medium text-primary">{lastBookingId}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </WorkspacePage>
  );
}
