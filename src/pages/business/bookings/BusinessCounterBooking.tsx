import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Banknote,
  CalendarIcon,
  Check,
  ChevronRight,
  FileText,
  Loader2,
  MessageCircle,
  Plus,
  Printer,
  QrCode,
  ShoppingCart,
  Smartphone,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomFieldsSection, { type CustomField } from "@/components/CustomFieldsSection";
import { useServices } from "@/stores/serviceManagementStore";
import { recordServiceBooking } from "@/stores/serviceBookingStore";
import { lookupPincode } from "@/lib/pincodeLookup";
import { SERVICE_CATEGORIES } from "@/types/serviceManagement";
import {
  BOOKING_PURPOSES,
  generateServiceSlots,
  parseServicePrice,
  paymentMethodFromMode,
} from "./counter/counterBookingConstants";

type SlotOption = { id: string; dateLabel: string; dateIso: string; timeLabel: string; available: number };

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
  time: string;
  available: number;
}

interface CartItem {
  cartId: string;
  service: CatalogItem;
  slot: SlotOption;
  quantity: number;
}

const steps = ["Browse & Add to Cart", "Customer Details", "Payment", "Confirm"];

const COUNTER_PAYMENT_MODES = [
  { id: "Cash", label: "Cash", purpose: "Cash received at the counter" },
  {
    id: "Bank Transfer",
    label: "Bank Transfer / UPI",
    purpose: "Record UTR or transfer reference",
    refLabel: "Reference No / UTR",
    refPlaceholder: "e.g. UTR4827384",
  },
  {
    id: "Cheque",
    label: "Cheque",
    purpose: "Payment by cheque",
    refLabel: "Cheque Number",
    refPlaceholder: "Cheque no. and bank",
  },
  { id: "UPI", label: "UPI Link (WhatsApp)", purpose: "Send payment link to customer" },
  { id: "QR Code", label: "QR Code", purpose: "Customer scans and pays" },
] as const;

const COUNTER_PAYMENT_GROUPS = [
  { title: "Cash · Bank Transfer · Cheque", modes: ["Cash", "Bank Transfer", "Cheque"] as const },
  { title: "Digital", modes: ["UPI", "QR Code"] as const },
] as const;

type CounterPaymentMode = (typeof COUNTER_PAYMENT_MODES)[number]["id"];

function dateToIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildSlotsForDate(service: CatalogItem, date: Date): SlotOption[] {
  const iso = dateToIso(date);
  const label = format(date, "EEE, dd MMM");
  const timeSlots = generateServiceSlots({ startTime: "09:00", endTime: "18:00" });
  const perSlot = Math.max(1, Math.floor(service.available / Math.max(timeSlots.length, 1)));
  return timeSlots.map((timeLabel, i) => ({
    id: `${iso}-${i}-${timeLabel}`,
    dateLabel: label,
    dateIso: iso,
    timeLabel,
    available: perSlot,
  }));
}

function getCounterPaymentMode(mode: string) {
  return COUNTER_PAYMENT_MODES.find((m) => m.id === mode) ?? COUNTER_PAYMENT_MODES[0];
}

function paymentModeNeedsRef(mode: string) {
  return mode === "Cheque" || mode === "Bank Transfer";
}

function paymentModeIcon(mode: CounterPaymentMode) {
  switch (mode) {
    case "Cash":
      return Banknote;
    case "Bank Transfer":
      return QrCode;
    case "Cheque":
      return FileText;
    case "UPI":
      return MessageCircle;
    case "QR Code":
      return Smartphone;
    default:
      return Banknote;
  }
}

function DigitalPaymentWaiting({
  mode,
  amount,
  phone,
  received,
  onPaymentReceived,
}: {
  mode: "UPI" | "QR Code";
  amount: number;
  phone: string;
  received: boolean;
  onPaymentReceived: () => void;
}) {
  if (received) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-emerald-200 bg-emerald-50/50 py-6 text-center">
        <Check className="h-10 w-10 text-emerald-600" />
        <p className="mt-2 font-semibold text-emerald-800">Payment received</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center space-y-3 rounded-xl border border-dashed bg-muted/20 px-4 py-6 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm font-semibold">Waiting for payment</p>
      <p className="text-xs text-muted-foreground">
        {mode === "UPI" ? `Link sent to +91 ${phone || "__________"}` : "QR active — waiting for scan"}
      </p>
      <p className="text-xl font-bold">₹{amount.toLocaleString("en-IN")}</p>
      <Button type="button" className="w-full" onClick={onPaymentReceived}>
        Payment Received
      </Button>
    </div>
  );
}

export default function BusinessCounterBooking() {
  const services = useServices();
  const catalog = useMemo<CatalogItem[]>(
    () =>
      services
        .filter((s) => s.status === "Active")
        .map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          price: parseServicePrice(s.price),
          time: "09:00 AM – 06:00 PM",
          available: 20,
        })),
    [services],
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [filterCategory, setFilterCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addingService, setAddingService] = useState<CatalogItem | null>(null);
  const [addingSlot, setAddingSlot] = useState<SlotOption | null>(null);
  const [addingDate, setAddingDate] = useState<Date | undefined>(new Date());
  const [addingQty, setAddingQty] = useState(1);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    pincode: "",
    city: "",
    state: "",
    purpose: BOOKING_PURPOSES[0] as string,
    purposeOther: "",
  });
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [paymentMode, setPaymentMode] = useState<CounterPaymentMode>("Cash");
  const [refNumber, setRefNumber] = useState("");
  const [upiPaymentReceived, setUpiPaymentReceived] = useState(false);
  const [qrPaymentStatus, setQrPaymentStatus] = useState<"Pending Payment" | "Paid">("Pending Payment");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentConfigured, setPaymentConfigured] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const filteredServices = catalog.filter((s) => filterCategory === "all" || s.category === filterCategory);
  const cartTotal = cart.reduce((sum, item) => sum + item.service.price * item.quantity, 0);
  const slotsForSelectedDate = useMemo(() => {
    if (!addingService || !addingDate) return [];
    return buildSlotsForDate(addingService, addingDate);
  }, [addingService, addingDate]);

  const addToCart = () => {
    if (!addingService || !addingSlot) return;
    setCart((prev) => [
      ...prev,
      {
        cartId: `C-${Date.now()}`,
        service: addingService,
        slot: addingSlot,
        quantity: addingQty,
      },
    ]);
    toast.success(`${addingService.name} added to cart`);
    setAddingService(null);
    setAddingSlot(null);
    setAddingDate(new Date());
    setAddingQty(1);
  };

  const removeFromCart = (cartId: string) => setCart((prev) => prev.filter((i) => i.cartId !== cartId));

  const updateCartQty = (cartId: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity: Math.max(1, Math.min(qty, item.slot.available)) } : item,
      ),
    );
  };

  const selectPaymentMode = (modeId: CounterPaymentMode) => {
    setPaymentMode(modeId);
    setRefNumber("");
    setUpiPaymentReceived(false);
    setQrPaymentStatus("Pending Payment");
    setPaymentConfigured(false);
    setPaymentDialogOpen(true);
  };

  const confirmPaymentDialog = () => {
    if (paymentMode === "UPI" && !upiPaymentReceived) {
      toast.error("Mark payment as received");
      return;
    }
    if (paymentMode === "QR Code" && qrPaymentStatus !== "Paid") {
      toast.error("Mark payment as received");
      return;
    }
    if (paymentModeNeedsRef(paymentMode) && !refNumber.trim()) {
      toast.error("Reference is required");
      return;
    }
    setPaymentConfigured(true);
    setPaymentDialogOpen(false);
    toast.success("Payment details saved");
  };

  useEffect(() => {
    const pin = customer.pincode.replace(/\D/g, "");
    if (pin.length !== 6) return;
    lookupPincode(pin).then((r) => {
      if (r) setCustomer((c) => ({ ...c, city: r.city, state: r.state }));
    });
  }, [customer.pincode]);

  const handleConfirm = () => {
    const purpose =
      customer.purpose === "Other" ? customer.purposeOther.trim() : customer.purpose;
    const payMode =
      paymentMode === "Bank Transfer" ? "Bank Transfer" : paymentMode === "Cheque" ? "Cheque" : paymentMode;

    cart.forEach((item) => {
      recordServiceBooking({
        serviceId: item.service.id,
        serviceName: item.service.name,
        category: item.service.category,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email || undefined,
        customerCity: customer.city || undefined,
        customerState: customer.state || undefined,
        customerPincode: customer.pincode || undefined,
        bookingPurpose: purpose || undefined,
        scheduledDate: item.slot.dateIso,
        scheduledTime: item.slot.timeLabel,
        amount: item.service.price * item.quantity,
        basePrice: item.service.price,
        pricingMode: "Fixed Price",
        source: "Counter",
        paymentMethod: paymentMethodFromMode(
          paymentMode === "Bank Transfer" ? "Bank Transfer" : paymentMode === "QR Code" ? "UPI" : (paymentMode as "Cash" | "UPI"),
        ),
        paymentMode: payMode,
        paymentStatus: "Paid",
        paidAmount: item.service.price * item.quantity,
        referenceNo: refNumber,
        status: "Confirmed",
        notes: customFields.length ? JSON.stringify(customFields) : undefined,
      });
    });
    setBookingComplete(true);
    toast.success("Booking confirmed");
  };

  const handleReset = () => {
    setCurrentStep(0);
    setCart([]);
    setCustomer({
      name: "",
      phone: "",
      email: "",
      pincode: "",
      city: "",
      state: "",
      purpose: BOOKING_PURPOSES[0],
      purposeOther: "",
    });
    setCustomFields([]);
    setPaymentMode("Cash");
    setRefNumber("");
    setBookingComplete(false);
    setPaymentConfigured(false);
  };

  if (bookingComplete) {
    return (
      <div className="py-2">
        <Card className="mx-auto max-w-lg">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold">Booking Confirmed</h2>
            <p className="mb-4 text-sm text-muted-foreground">{cart.length} service(s) booked for {customer.name}</p>
            <div className="mb-4 space-y-2 rounded-lg bg-muted/50 p-3 text-left text-sm">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Printer className="h-3.5 w-3.5" />
                Receipt
              </Button>
              <Button size="sm" onClick={handleReset}>
                New Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-1">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Counter Booking</h1>
        <p className="text-sm text-muted-foreground">Book services for walk-in or phone customers</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {steps.map((step, i) => (
          <div key={step} className="flex shrink-0 items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                i <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {i < currentStep ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={`text-xs font-medium ${i <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
              {step}
            </span>
            {i < steps.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {currentStep === 0 && (
            <>
              <AnimatePresence>
                {addingService && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <Card className="border-primary">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">Select slot for {addingService.name}</CardTitle>
                            <CardDescription>{addingService.category} · ₹{addingService.price.toLocaleString("en-IN")}</CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setAddingService(null);
                              setAddingSlot(null);
                              setAddingDate(new Date());
                              setAddingQty(1);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="min-w-[180px] flex-1">
                            <Label className="text-xs text-muted-foreground">Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="mt-1 h-9 w-full justify-start font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {addingDate ? format(addingDate, "EEE, dd MMM yyyy") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={addingDate}
                                  onSelect={(d) => {
                                    setAddingDate(d);
                                    setAddingSlot(null);
                                  }}
                                  disabled={(d) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return d < today;
                                  }}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            {addingDate ? "Available time slots" : "Pick a date to view slots"}
                          </Label>
                          <div className="mt-2 grid max-h-[180px] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 md:grid-cols-5">
                            {addingDate &&
                              slotsForSelectedDate.map((slot) => (
                                <button
                                  key={slot.id}
                                  type="button"
                                  onClick={() => {
                                    setAddingSlot(slot);
                                    setAddingQty((q) => Math.min(q, slot.available));
                                  }}
                                  className={`rounded-lg border p-2 text-left text-sm transition-all hover:bg-muted/50 ${
                                    addingSlot?.id === slot.id
                                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                      : ""
                                  }`}
                                >
                                  <p className="text-xs font-semibold">{slot.timeLabel}</p>
                                  <Badge variant="secondary" className="mt-1 text-[9px]">
                                    {slot.available} left
                                  </Badge>
                                </button>
                              ))}
                          </div>
                        </div>
                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              type="number"
                              min={1}
                              max={addingSlot?.available ?? addingService.available}
                              value={addingQty}
                              onChange={(e) =>
                                setAddingQty(
                                  Math.min(
                                    Math.max(1, Number(e.target.value) || 1),
                                    addingSlot?.available ?? addingService.available,
                                  ),
                                )
                              }
                              className="h-9 w-24"
                              disabled={!addingSlot}
                            />
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Subtotal</p>
                            <p className="text-lg font-bold">₹{(addingService.price * addingQty).toLocaleString("en-IN")}</p>
                          </div>
                          <Button onClick={addToCart} disabled={!addingSlot} className="gap-1.5">
                            <Plus className="h-4 w-4" />
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">Services</CardTitle>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="h-8 w-[160px] text-xs">
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
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {filteredServices.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setAddingService(s);
                          setAddingSlot(null);
                          setAddingDate(new Date());
                          setAddingQty(1);
                        }}
                        className="rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-muted/30"
                      >
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.category}</p>
                        <p className="mt-1 text-sm font-semibold">₹{s.price.toLocaleString("en-IN")}</p>
                      </button>
                    ))}
                    {filteredServices.length === 0 && (
                      <p className="col-span-2 py-6 text-center text-sm text-muted-foreground">
                        No active services — publish services in Service Listings first.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {currentStep === 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Name *</Label>
                    <Input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Customer name" />
                  </div>
                  <div>
                    <Label>Mobile *</Label>
                    <Input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="+91 …" />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="email@example.com" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Pincode</Label>
                    <Input value={customer.pincode} onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })} placeholder="575002" />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input value={customer.state} onChange={(e) => setCustomer({ ...customer, state: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Booking purpose</Label>
                  <Select value={customer.purpose} onValueChange={(v) => setCustomer({ ...customer, purpose: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BOOKING_PURPOSES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {customer.purpose === "Other" && (
                  <Input
                    value={customer.purposeOther}
                    onChange={(e) => setCustomer({ ...customer, purposeOther: e.target.value })}
                    placeholder="Specify purpose"
                  />
                )}
                <CustomFieldsSection fields={customFields} onFieldsChange={setCustomFields} />
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setCurrentStep(0)}>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep(2)} disabled={!customer.name.trim() || !customer.phone.trim()}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                {COUNTER_PAYMENT_GROUPS.map((group, gi) => (
                  <div key={group.title} className="space-y-2 rounded-lg border p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{group.title}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {group.modes.map((modeId) => {
                        const mode = getCounterPaymentMode(modeId);
                        const selected = paymentMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => selectPaymentMode(mode.id)}
                            className={`rounded-lg border-2 p-2.5 text-left text-sm ${selected ? "border-primary bg-primary/5" : "border-border"}`}
                          >
                            <span className="font-semibold">{mode.label}</span>
                            <span className="mt-0.5 block text-[10px] text-muted-foreground">{mode.purpose}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{getCounterPaymentMode(paymentMode).label}</DialogTitle>
                      <DialogDescription>{getCounterPaymentMode(paymentMode).purpose}</DialogDescription>
                    </DialogHeader>
                    {paymentMode === "UPI" && (
                      <DigitalPaymentWaiting
                        mode="UPI"
                        amount={cartTotal}
                        phone={customer.phone.replace(/\D/g, "").slice(-10)}
                        received={upiPaymentReceived}
                        onPaymentReceived={() => setUpiPaymentReceived(true)}
                      />
                    )}
                    {paymentMode === "QR Code" && (
                      <DigitalPaymentWaiting
                        mode="QR Code"
                        amount={cartTotal}
                        phone=""
                        received={qrPaymentStatus === "Paid"}
                        onPaymentReceived={() => setQrPaymentStatus("Paid")}
                      />
                    )}
                    {paymentModeNeedsRef(paymentMode) && (
                      <Input value={refNumber} onChange={(e) => setRefNumber(e.target.value)} placeholder="Reference" />
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={confirmPaymentDialog}>Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (!paymentConfigured) {
                        toast.error("Complete payment setup first");
                        return;
                      }
                      setCurrentStep(3);
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Confirm Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 rounded-lg border p-3 text-sm">
                  {cart.map((item) => (
                    <div key={item.cartId} className="flex justify-between">
                      <span>
                        {item.service.name} × {item.quantity}
                        <span className="ml-1 text-xs text-muted-foreground">
                          {item.slot.dateLabel} {item.slot.timeLabel}
                        </span>
                      </span>
                      <span>₹{(item.service.price * item.quantity).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-medium">{customer.name}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button className="gap-2" onClick={handleConfirm}>
                    <Store className="h-4 w-4" />
                    Confirm & Book
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                  <Badge variant="secondary" className="ml-auto">
                    {cart.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">Click a service to add</p>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.cartId} className="rounded-lg border p-2.5 text-sm">
                        <div className="flex justify-between gap-2">
                          <div>
                            <p className="font-medium">{item.service.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {item.slot.dateLabel} · {item.slot.timeLabel}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFromCart(item.cartId)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateCartQty(item.cartId, item.quantity - 1)}>
                              −
                            </Button>
                            <span className="w-6 text-center text-xs">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateCartQty(item.cartId, item.quantity + 1)}>
                              +
                            </Button>
                          </div>
                          <span className="font-semibold">₹{(item.service.price * item.quantity).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold text-sm">
                      <span>Total</span>
                      <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                    </div>
                    {currentStep === 0 && (
                      <Button className="w-full" disabled={!cart.length} onClick={() => setCurrentStep(1)}>
                        Proceed
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
