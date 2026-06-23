import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Layers,
  Mail,
  MessageCircle,
  Phone,
  Printer,
  Search,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusPill } from "@/components/ui/status-pill";
import { formatPrice, formatPackageId, formatServiceId, packageCombinedPriceValue, packagePriceParts } from "@/components/service-management/shared";
import { useServices, usePackages } from "@/stores/serviceManagementStore";
import {
  createServiceCustomer,
  searchServiceCustomers,
  useServiceCustomers,
} from "@/stores/serviceCustomerStore";
import { recordServiceBooking } from "@/stores/serviceBookingStore";
import type { ServiceCustomer } from "@/types/serviceCustomer";
import type {
  CounterPricingMode,
  PaymentStatus,
  ServiceBooking,
  ServiceBookingDetails,
  ServiceBookingListingType,
  ServiceBookingStatus,
} from "@/types/serviceBooking";
import type { BusinessService, ServicePackage } from "@/types/serviceManagement";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatBookingAmount, formatBookingDate, formatBookingId } from "../bookingFormat";
import { formatBookingReceiptNo } from "../bookingReceiptUtils";
import {
  BOOKING_STATUSES,
  bookingStatusTone,
  computeTotalAmount,
  CounterPaymentMode,
  getServiceDetailFields,
  PAYMENT_MODES,
  PAYMENT_STATUSES,
  paymentMethodFromMode,
  parseServicePrice,
  SERVICE_DETAIL_FIELD_LABELS,
  WIZARD_STEPS,
  type ServiceDetailField,
} from "./counterBookingConstants";

interface NewCounterBookingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (booking: ServiceBooking) => void;
}

export function NewCounterBookingDrawer({ open, onOpenChange, onCreated }: NewCounterBookingDrawerProps) {
  const services = useServices();
  const packages = usePackages();
  const customers = useServiceCustomers();
  const activeServices = useMemo(() => services.filter((s) => s.status === "Active"), [services]);
  const activePackages = useMemo(() => packages.filter((p) => p.status === "Active"), [packages]);

  const [step, setStep] = useState(0);
  const [customerQuery, setCustomerQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<ServiceCustomer | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [listingType, setListingType] = useState<ServiceBookingListingType>("service");
  const [serviceId, setServiceId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [serviceDetails, setServiceDetails] = useState<ServiceBookingDetails>({});
  const [detailNotes, setDetailNotes] = useState("");

  const [pricingMode, setPricingMode] = useState<CounterPricingMode>("Fixed Price");
  const [customPrice, setCustomPrice] = useState("");
  const [additionalCharges, setAdditionalCharges] = useState("");
  const [discount, setDiscount] = useState("");

  const [bookingStatus, setBookingStatus] = useState<ServiceBookingStatus>("Enquiry");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Pending");
  const [paymentMode, setPaymentMode] = useState<CounterPaymentMode>("Cash");
  const [referenceNo, setReferenceNo] = useState("");
  const [paidAmount, setPaidAmount] = useState("");

  const [createdBooking, setCreatedBooking] = useState<ServiceBooking | null>(null);

  const selectedPackage = activePackages.find((p) => p.id === packageId);
  const selectedService =
    listingType === "package" && selectedPackage
      ? activeServices.find((s) => s.id === selectedPackage.primaryServiceId)
      : activeServices.find((s) => s.id === serviceId);
  const bookingTitle =
    listingType === "package" && selectedPackage ? selectedPackage.name : selectedService?.name;
  const basePrice =
    listingType === "package" && selectedPackage && selectedService
      ? packageCombinedPriceValue(selectedPackage, selectedService)
      : selectedService
        ? parseServicePrice(selectedService.price)
        : 0;
  const detailFields = selectedService ? getServiceDetailFields(selectedService.category) : [];

  const totalAmount = computeTotalAmount(
    basePrice,
    Number(additionalCharges) || 0,
    Number(discount) || 0,
    pricingMode === "Custom Price" ? Number(customPrice) || 0 : undefined,
  );

  const customerResults = useMemo(() => {
    if (!customerQuery.trim()) return customers.slice(0, 6);
    return searchServiceCustomers(customerQuery).slice(0, 8);
  }, [customerQuery, customers]);

  const reset = () => {
    setStep(0);
    setCustomerQuery("");
    setSelectedCustomer(null);
    setCreatingNew(false);
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewAddress("");
    setNewNotes("");
    setListingType("service");
    setServiceId("");
    setPackageId("");
    setScheduledDate("");
    setScheduledTime("");
    setServiceDetails({});
    setDetailNotes("");
    setPricingMode("Fixed Price");
    setCustomPrice("");
    setAdditionalCharges("");
    setDiscount("");
    setBookingStatus("Enquiry");
    setPaymentStatus("Pending");
    setPaymentMode("Cash");
    setReferenceNo("");
    setPaidAmount("");
    setCreatedBooking(null);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const resolveCustomer = (): ServiceCustomer | null => {
    if (selectedCustomer) return selectedCustomer;
    if (creatingNew && newName.trim() && newPhone.trim()) {
      return createServiceCustomer({
        name: newName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim() || undefined,
        address: newAddress.trim() || undefined,
        notes: newNotes.trim() || undefined,
      });
    }
    return null;
  };

  const initPricingFromService = (service: BusinessService) => {
    if (service.pricingType === "Quote Based") {
      setPricingMode("Quote Based");
    } else {
      setPricingMode("Fixed Price");
    }
    setCustomPrice("");
    setAdditionalCharges("");
    setDiscount("");
  };

  const initPricingFromPackage = (pkg: ServicePackage, primary: BusinessService) => {
    initPricingFromService(primary);
    if (primary.pricingType !== "Quote Based" && pkg.price) {
      setPricingMode("Fixed Price");
    }
  };

  const selectService = (service: BusinessService) => {
    setListingType("service");
    setServiceId(service.id);
    setPackageId("");
    initPricingFromService(service);
    setServiceDetails({});
  };

  const selectPackage = (pkg: ServicePackage) => {
    const primary = activeServices.find((s) => s.id === pkg.primaryServiceId);
    if (!primary) {
      toast.error("Primary service for this package is not available");
      return;
    }
    setListingType("package");
    setPackageId(pkg.id);
    setServiceId(pkg.primaryServiceId);
    initPricingFromPackage(pkg, primary);
    setServiceDetails({});
  };

  const setDetailField = (field: ServiceDetailField, value: string) => {
    setServiceDetails((prev) => {
      const next = { ...prev };
      if (field === "guestCount" || field === "participants" || field === "roomCount") {
        const n = Number(value);
        if (value === "" || Number.isNaN(n)) delete next[field];
        else next[field] = n;
      } else if (value.trim()) {
        next[field] = value.trim();
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 0:
        if (listingType === "service" && !serviceId) {
          toast.error("Select a service to book");
          return false;
        }
        if (listingType === "package" && !packageId) {
          toast.error("Select a package to book");
          return false;
        }
        if (!selectedService) {
          toast.error("Selected listing is unavailable");
          return false;
        }
        return true;
      case 1: {
        if (selectedCustomer) return true;
        if (creatingNew) {
          if (!newName.trim() || !newPhone.trim()) {
            toast.error("Customer name and mobile are required");
            return false;
          }
          return true;
        }
        toast.error("Select or create a customer");
        return false;
      }
      case 2:
        if (!scheduledDate || !scheduledTime) {
          toast.error("Service date and time are required");
          return false;
        }
        if (detailFields.includes("location") && !serviceDetails.location?.trim()) {
          toast.error("Location is required");
          return false;
        }
        return true;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const submitBooking = () => {
    const customer = resolveCustomer();
    if (!customer || !selectedService) return;
    if (listingType === "package" && !selectedPackage) return;

    const booking = recordServiceBooking({
      customerId: customer.id,
      listingType,
      packageId: listingType === "package" ? packageId : undefined,
      serviceId: listingType === "package" ? selectedPackage!.primaryServiceId : selectedService.id,
      serviceName: listingType === "package" ? selectedPackage!.name : selectedService.name,
      category: selectedService.category,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerAddress: customer.address,
      customerCity: customer.city,
      customerState: customer.state,
      customerPincode: customer.pincode,
      scheduledDate,
      scheduledTime,
      serviceDetails: Object.keys(serviceDetails).length ? serviceDetails : undefined,
      basePrice,
      additionalCharges: Number(additionalCharges) || 0,
      discount: Number(discount) || 0,
      pricingMode,
      amount: totalAmount,
      source: "Counter",
      paymentMethod: paymentMethodFromMode(paymentMode),
      paymentMode,
      paymentStatus,
      paidAmount: Number(paidAmount) || 0,
      referenceNo: referenceNo.trim() || undefined,
      status: bookingStatus,
      notes: detailNotes.trim() || customer.notes || undefined,
    });

    setCreatedBooking(booking);
    onCreated?.(booking);
    setStep(6);
    toast.success("Counter booking created");
  };

  const goNext = () => {
    if (!validateStep()) return;
    if (step === 1 && creatingNew && !selectedCustomer) {
      const c = resolveCustomer();
      if (c) setSelectedCustomer(c);
    }
    if (step === 5) {
      submitBooking();
      return;
    }
    setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] max-w-xl flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-5 py-4 text-left">
          <DialogTitle className="text-base">New Counter Booking</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {WIZARD_STEPS.length} · {WIZARD_STEPS[step]}
          </DialogDescription>
          <div className="flex gap-1 pt-2">
            {WIZARD_STEPS.map((_, i) => (
              <div
                key={WIZARD_STEPS[i]}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i <= step ? "bg-primary" : "bg-muted",
                )}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">What would the customer like to book?</p>

              <div className="flex rounded-lg border p-1">
                <button
                  type="button"
                  onClick={() => {
                    setListingType("service");
                    setPackageId("");
                  }}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    listingType === "service" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Individual Service
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setListingType("package");
                    setServiceId("");
                  }}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    listingType === "package" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Layers className="size-4" />
                  Package
                </button>
              </div>

              {listingType === "service" && (
                <div className="space-y-2">
                  {activeServices.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectService(s)}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                        serviceId === s.id && listingType === "service" && "border-primary bg-primary/5",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.category} · {formatServiceId(s.id)} · {formatPrice(s)}
                        </p>
                      </div>
                      {serviceId === s.id && listingType === "service" && (
                        <Check className="size-4 shrink-0 text-primary" />
                      )}
                    </button>
                  ))}
                  {activeServices.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No active services. Publish a service first.
                    </p>
                  )}
                </div>
              )}

              {listingType === "package" && (
                <div className="space-y-2">
                  {activePackages.map((pkg) => {
                    const primary = activeServices.find((s) => s.id === pkg.primaryServiceId);
                    const priceParts = packagePriceParts(pkg, primary);
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => selectPackage(pkg)}
                        className={cn(
                          "flex w-full items-start justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                          packageId === pkg.id && "border-primary bg-primary/5",
                        )}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{pkg.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {primary?.name ?? "Unknown service"} · {formatPackageId(pkg.id)}
                          </p>
                          {pkg.description && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{pkg.description}</p>
                          )}
                          <p className="mt-1 text-xs font-medium text-foreground">
                            {priceParts.main}
                            {priceParts.sub && (
                              <span className="ml-1 font-normal text-muted-foreground">({priceParts.sub})</span>
                            )}
                          </p>
                        </div>
                        {packageId === pkg.id && <Check className="size-4 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                  {activePackages.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No active packages. Publish a package in Service Listing first.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {bookingTitle && selectedService && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    {listingType === "package" ? "Package: " : "Service: "}
                  </span>
                  <span className="font-medium">{bookingTitle}</span>
                  {listingType === "package" && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Based on {selectedService.name} · {selectedService.category}
                    </p>
                  )}
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by mobile or customer name"
                  value={customerQuery}
                  onChange={(e) => setCustomerQuery(e.target.value)}
                />
              </div>

              {!creatingNew && (
                <div className="space-y-2">
                  {customerResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(c);
                        setCreatingNew(false);
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                        selectedCustomer?.id === c.id && "border-primary bg-primary/5",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.phone}</p>
                        {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                      </div>
                      {selectedCustomer?.id === c.id && <Check className="size-4 shrink-0 text-primary" />}
                    </button>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  setCreatingNew(true);
                  setSelectedCustomer(null);
                }}
              >
                <UserPlus className="size-4" />
                Create New Customer
              </Button>

              {creatingNew && (
                <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                  <div className="space-y-2">
                    <Label>Customer Name *</Label>
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Number *</Label>
                    <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+91 …" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} rows={2} />
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && selectedService && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Service Date *</Label>
                  <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Service Time *</Label>
                  <Input value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} placeholder="e.g. 10:30 AM" />
                </div>
              </div>

              {detailFields.map((field) => (
                <div key={field} className="space-y-2">
                  <Label>
                    {SERVICE_DETAIL_FIELD_LABELS[field]}
                    {field === "location" ? " *" : ""}
                  </Label>
                  <Input
                    type={field === "guestCount" || field === "participants" || field === "roomCount" ? "number" : field.includes("check") ? "date" : "text"}
                    value={String(serviceDetails[field] ?? "")}
                    onChange={(e) => setDetailField(field, e.target.value)}
                    placeholder={
                      field === "eventType" ? "Wedding, Housewarming…" :
                      field === "vehicleType" ? "Sedan, Innova…" : undefined
                    }
                  />
                </div>
              ))}

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={detailNotes} onChange={(e) => setDetailNotes(e.target.value)} rows={3} />
              </div>
            </div>
          )}

          {step === 3 && selectedService && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/20 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {listingType === "package" ? "Package price" : "Service price"}
                  </span>
                  <span className="font-mono">{formatBookingAmount(basePrice)}</span>
                </div>
                {listingType === "package" && selectedPackage && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(() => {
                      const parts = packagePriceParts(selectedPackage, selectedService);
                      return parts.sub ?? selectedPackage.name;
                    })()}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Pricing type</Label>
                <Select value={pricingMode} onValueChange={(v) => setPricingMode(v as CounterPricingMode)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed Price">Fixed Price</SelectItem>
                    <SelectItem value="Custom Price">Custom Price</SelectItem>
                    <SelectItem value="Quote Based">Quote Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {pricingMode === "Custom Price" && (
                <div className="space-y-2">
                  <Label>Custom price</Label>
                  <Input type="number" min={0} value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Additional charges</Label>
                  <Input type="number" min={0} value={additionalCharges} onChange={(e) => setAdditionalCharges(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Discount</Label>
                  <Input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                <span className="text-sm font-medium">Total amount</span>
                <span className="font-mono text-lg font-semibold tabular-nums">{formatBookingAmount(totalAmount)}</span>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2">
              <Label>Booking status</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {BOOKING_STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setBookingStatus(st)}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      bookingStatus === st ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Payment status</Label>
                <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment mode</Label>
                <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as CounterPaymentMode)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_MODES.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {paymentMode !== "Cash" && (
                <div className="space-y-2">
                  <Label>Reference / UTR</Label>
                  <Input value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} />
                </div>
              )}
              {(paymentStatus === "Partial" || paymentStatus === "Paid") && (
                <div className="space-y-2">
                  <Label>Amount received</Label>
                  <Input
                    type="number"
                    min={0}
                    max={totalAmount}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder={String(totalAmount)}
                  />
                </div>
              )}
            </div>
          )}

          {step === 6 && createdBooking && (
            <div className="space-y-4">
              <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-center">
                <Check className="mx-auto mb-2 size-8 text-success" />
                <p className="font-medium">Booking created</p>
                <p className="mt-1 font-mono text-sm text-primary">{formatBookingId(createdBooking.id)}</p>
              </div>

              <dl className="space-y-2 rounded-lg border p-4 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{createdBooking.customerName}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {createdBooking.listingType === "package" ? "Package" : "Service"}
                  </span>
                  <span className="text-right font-medium">{createdBooking.serviceName}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Date</span>
                  <span>{formatBookingDate(createdBooking.scheduledDate)} · {createdBooking.scheduledTime}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-mono font-semibold">{formatBookingAmount(createdBooking.amount)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Status</span>
                  <StatusPill label={createdBooking.status} tone={bookingStatusTone[createdBooking.status]} />
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Receipt</span>
                  <span className="font-mono text-xs">{formatBookingReceiptNo(createdBooking)}</span>
                </div>
              </dl>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                  <Printer className="size-4" /> Print
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => toast.info("WhatsApp share — connect in settings")}>
                  <MessageCircle className="size-4" /> WhatsApp
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => toast.info("SMS — connect in settings")}>
                  <Phone className="size-4" /> SMS
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => toast.info("Email — connect in settings")}>
                  <Mail className="size-4" /> Email
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t px-5 py-4">
          {step > 0 && step < 6 && (
            <Button type="button" variant="outline" className="gap-2" onClick={goBack}>
              <ArrowLeft className="size-4" /> Back
            </Button>
          )}
          {step < 6 ? (
            <Button type="button" className="ml-auto gap-2" onClick={goNext}>
              {step === 5 ? "Create booking" : "Continue"}
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button type="button" className="ml-auto" onClick={() => handleClose(false)}>
              Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
