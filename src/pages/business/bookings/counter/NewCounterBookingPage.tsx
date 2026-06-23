import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Loader2, Package, Search, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { WorkspacePage, WorkspaceStatusBar } from "@/components/workspace";
import {
  formatPrice,
  packageCombinedPriceValue,
  packagePriceParts,
} from "@/components/service-management/shared";
import { useServices, usePackages } from "@/stores/serviceManagementStore";
import {
  createServiceCustomer,
  findCustomerByPhone,
  searchServiceCustomers,
} from "@/stores/serviceCustomerStore";
import { recordServiceBooking } from "@/stores/serviceBookingStore";
import { lookupPincode } from "@/lib/pincodeLookup";
import type { ServiceBookingListingType } from "@/types/serviceBooking";
import type { ServiceCustomer } from "@/types/serviceCustomer";
import type { BusinessService } from "@/types/serviceManagement";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatBookingAmount, formatBookingDate, formatBookingId } from "../bookingFormat";
import {
  BOOKING_PURPOSES,
  generateServiceSlots,
  parseServicePrice,
  paymentMethodFromMode,
} from "./counterBookingConstants";

type Step = 1 | 2 | 3 | "done";

interface BookingDraft {
  listingType: ServiceBookingListingType;
  serviceId: string;
  packageId?: string;
  serviceName: string;
  category: string;
  amount: number;
  scheduledDate: string;
  scheduledTime: string;
}

const STEP_TITLES = ["What to book?", "Devotee details", "Payment"];

export default function NewCounterBookingPage() {
  const navigate = useNavigate();
  const services = useServices();
  const packages = usePackages();
  const activeServices = useMemo(() => services.filter((s) => s.status === "Active"), [services]);
  const activePackages = useMemo(() => packages.filter((p) => p.status === "Active"), [packages]);
  const today = new Date().toISOString().slice(0, 10);

  const [step, setStep] = useState<Step>(1);
  const [listingType, setListingType] = useState<ServiceBookingListingType>("service");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState(today);
  const [scheduleSlot, setScheduleSlot] = useState("");
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [email, setEmail] = useState("");
  const [pan, setPan] = useState("");
  const [purpose, setPurpose] = useState<string>(BOOKING_PURPOSES[0]);
  const [purposeOther, setPurposeOther] = useState("");
  const [linkedCustomerId, setLinkedCustomerId] = useState<string | null>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const lastPinLookup = useRef("");

  const [createdId, setCreatedId] = useState<string | null>(null);

  const selectedService = selectedId ? activeServices.find((s) => s.id === selectedId) : undefined;
  const selectedPackage = selectedId ? activePackages.find((p) => p.id === selectedId) : undefined;
  const selectedPrimary =
    listingType === "package" && selectedPackage
      ? activeServices.find((s) => s.id === selectedPackage.primaryServiceId)
      : selectedService;

  const slots = useMemo(
    () => generateServiceSlots(selectedPrimary ?? { startTime: "06:00", endTime: "18:00" }),
    [selectedPrimary],
  );

  const amount = useMemo(() => {
    if (listingType === "service" && selectedService) return parseServicePrice(selectedService.price);
    if (listingType === "package" && selectedPackage && selectedPrimary) {
      return packageCombinedPriceValue(selectedPackage, selectedPrimary);
    }
    return 0;
  }, [listingType, selectedService, selectedPackage, selectedPrimary]);

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (listingType === "service") {
      return activeServices.filter(
        (s) => !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q),
      );
    }
    return activePackages.filter((pkg) => {
      const primary = activeServices.find((s) => s.id === pkg.primaryServiceId);
      return !q || pkg.name.toLowerCase().includes(q) || primary?.name.toLowerCase().includes(q);
    });
  }, [listingType, activeServices, activePackages, search]);

  const phoneMatches = useMemo(() => {
    if (phone.replace(/\D/g, "").length < 4) return [];
    return searchServiceCustomers(phone).slice(0, 3);
  }, [phone]);

  useEffect(() => {
    const clean = pincode.replace(/\D/g, "");
    if (clean.length !== 6 || clean === lastPinLookup.current) return;
    const timer = window.setTimeout(async () => {
      lastPinLookup.current = clean;
      setPincodeLoading(true);
      const result = await lookupPincode(clean);
      setPincodeLoading(false);
      if (result) {
        setCity(result.city);
        setState(result.state);
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [pincode]);

  const pickItem = (id: string) => {
    setSelectedId(id);
    const primary =
      listingType === "package"
        ? activeServices.find((s) => s.id === activePackages.find((p) => p.id === id)?.primaryServiceId)
        : activeServices.find((s) => s.id === id);
    const nextSlots = generateServiceSlots(primary ?? {});
    setScheduleSlot(nextSlots[0] ?? "");
    setScheduleDate(today);
  };

  const switchType = (type: ServiceBookingListingType) => {
    setListingType(type);
    setSelectedId(null);
    setScheduleSlot("");
    setSearch("");
  };

  const applyCustomer = (c: ServiceCustomer) => {
    setLinkedCustomerId(c.id);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email ?? "");
    setPincode(c.pincode ?? "");
    setCity(c.city ?? "");
    setState(c.state ?? "");
    if (c.pincode) lastPinLookup.current = c.pincode.replace(/\D/g, "");
  };

  const goStep1 = () => {
    if (!selectedId || !scheduleDate || !scheduleSlot) {
      toast.error("Pick a service/package, date, and time");
      return;
    }
    const svc = selectedService;
    const pkg = selectedPackage;
    const primary = selectedPrimary;
    if (listingType === "service" && svc) {
      setDraft({
        listingType: "service",
        serviceId: svc.id,
        serviceName: svc.name,
        category: svc.category,
        amount,
        scheduledDate: scheduleDate,
        scheduledTime: scheduleSlot,
      });
    } else if (listingType === "package" && pkg && primary) {
      setDraft({
        listingType: "package",
        serviceId: pkg.primaryServiceId,
        packageId: pkg.id,
        serviceName: pkg.name,
        category: primary.category,
        amount,
        scheduledDate: scheduleDate,
        scheduledTime: scheduleSlot,
      });
    } else return;
    setStep(2);
  };

  const goStep2 = () => {
    if (!phone.trim() || !name.trim()) {
      toast.error("Mobile and name are required");
      return;
    }
    if (pincode.replace(/\D/g, "").length !== 6 || !city.trim() || !state.trim()) {
      toast.error("Enter pincode — city and state will fill automatically");
      return;
    }
    if (purpose === "Other" && !purposeOther.trim()) {
      toast.error("Please describe the purpose");
      return;
    }
    setStep(3);
  };

  const completePaidCash = () => {
    if (!draft) return;
    finishBooking("Paid", "Cash", draft.amount, undefined);
  };

  const completePayLater = () => {
    if (!draft) return;
    finishBooking("Pending", "Cash", 0, undefined);
  };

  const finishBooking = (
    paymentStatus: "Paid" | "Pending" | "Partial",
    paymentMode: "Cash" | "UPI" | "Card" | "Bank Transfer",
    paid: number,
    reference?: string,
  ) => {
    if (!draft) return;
    let customerId = linkedCustomerId ?? undefined;
    if (!customerId) {
      customerId = createServiceCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.replace(/\D/g, ""),
      }).id;
    }
    const booking = recordServiceBooking({
      customerId,
      listingType: draft.listingType,
      packageId: draft.packageId,
      serviceId: draft.serviceId,
      serviceName: draft.serviceName,
      category: draft.category,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim() || undefined,
      customerCity: city.trim(),
      customerState: state.trim(),
      customerPincode: pincode.replace(/\D/g, ""),
      customerPan: pan.trim().toUpperCase() || undefined,
      bookingPurpose: purpose === "Other" ? purposeOther.trim() : purpose,
      scheduledDate: draft.scheduledDate,
      scheduledTime: draft.scheduledTime,
      basePrice: draft.amount,
      pricingMode: "Fixed Price",
      amount: draft.amount,
      source: "Counter",
      paymentMethod: paymentMethodFromMode(paymentMode),
      paymentMode,
      paymentStatus,
      paidAmount: paid,
      referenceNo: reference,
      status: paymentStatus === "Paid" ? "Confirmed" : "Enquiry",
    });
    setCreatedId(booking.id);
    setStep("done");
    toast.success("Booking done");
  };

  const resetAll = () => {
    setStep(1);
    setListingType("service");
    setSearch("");
    setSelectedId(null);
    setScheduleDate(today);
    setScheduleSlot("");
    setDraft(null);
    setPhone("");
    setName("");
    setPincode("");
    setCity("");
    setState("");
    setEmail("");
    setPan("");
    setPurpose(BOOKING_PURPOSES[0]);
    setPurposeOther("");
    setLinkedCustomerId(null);
    setShowExtra(false);
    setCreatedId(null);
    lastPinLookup.current = "";
  };

  const goBack = () => {
    if (step === 1) navigate("/business-connect/bookings/counter");
    else if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const selectedLabel =
    listingType === "service" ? selectedService?.name : selectedPackage?.name;

  return (
    <WorkspacePage
      eyebrow="Counter · New booking"
      title={step === "done" ? "Done" : STEP_TITLES[(step as number) - 1]}
      statusBar={<WorkspaceStatusBar />}
      actions={
        step !== "done" ? (
          <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={goBack}>
            <ArrowLeft className="size-4" />
            {step === 1 ? "Close" : "Back"}
          </Button>
        ) : undefined
      }
    >
      {step !== "done" && (
        <div className="shrink-0 border-b border-border bg-muted/30 px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-2xl items-center gap-2">
            {STEP_TITLES.map((label, i) => {
              const n = i + 1;
              const active = step === n;
              const done = (step as number) > n;
              return (
                <div key={label} className="flex flex-1 items-center gap-2">
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      done && "bg-primary text-primary-foreground",
                      active && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      !done && !active && "bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : n}
                  </div>
                  <span className={cn("hidden text-sm font-medium sm:inline", active ? "text-foreground" : "text-muted-foreground")}>
                    {label}
                  </span>
                  {i < 2 && <div className={cn("h-0.5 flex-1 rounded", done ? "bg-primary" : "bg-border")} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        {/* ——— STEP 1: Pick item ——— */}
        {step === 1 && (
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-5 sm:px-6">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => switchType("service")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all",
                  listingType === "service"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <User className="size-4" />
                Services
              </button>
              <button
                type="button"
                onClick={() => switchType("package")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all",
                  listingType === "package"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <Package className="size-4" />
                Packages
              </button>
            </div>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-11 pl-10 text-base"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="mt-4 grid flex-1 content-start gap-3 sm:grid-cols-2">
              {listingType === "service"
                ? (items as BusinessService[]).map((s) => (
                    <ItemCard
                      key={s.id}
                      selected={selectedId === s.id}
                      title={s.name}
                      subtitle={s.category}
                      price={formatPrice(s)}
                      onClick={() => pickItem(s.id)}
                    />
                  ))
                : items.map((pkg) => {
                    const primary = activeServices.find((s) => s.id === pkg.primaryServiceId);
                    const parts = packagePriceParts(pkg, primary);
                    return (
                      <ItemCard
                        key={pkg.id}
                        selected={selectedId === pkg.id}
                        title={pkg.name}
                        subtitle={primary?.name ?? "Package"}
                        price={parts.main}
                        onClick={() => pickItem(pkg.id)}
                      />
                    );
                  })}
              {items.length === 0 && (
                <p className="col-span-full py-16 text-center text-sm text-muted-foreground">Nothing found. Try another search.</p>
              )}
            </div>

            {selectedId && (
              <div className="mt-4 shrink-0 space-y-4 rounded-2xl border-2 border-primary/30 bg-primary/[0.04] p-4 sm:p-5">
                <p className="font-semibold">{selectedLabel}</p>
                <p className="text-2xl font-bold tabular-nums text-primary">{formatBookingAmount(amount)}</p>

                <div>
                  <Label className="mb-2 block text-xs font-medium text-muted-foreground">Date</Label>
                  <Input type="date" min={today} className="h-11" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                </div>

                <div>
                  <Label className="mb-2 block text-xs font-medium text-muted-foreground">Time slot</Label>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setScheduleSlot(slot)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                          scheduleSlot === slot
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:border-primary/50",
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="button" size="lg" className="h-12 w-full gap-2 text-base" onClick={goStep1}>
                  Next — Devotee details
                  <ArrowRight className="size-5" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ——— STEP 2: Devotee ——— */}
        {step === 2 && draft && (
          <div className="mx-auto w-full max-w-md flex-1 px-4 py-6 sm:px-6">
            <SummaryChip draft={draft} />

            <div className="mt-6 space-y-5">
              <Field label="Mobile number" required>
                <Input
                  className="h-12 text-lg"
                  inputMode="tel"
                  autoFocus
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setLinkedCustomerId(null);
                  }}
                  onBlur={() => {
                    const m = findCustomerByPhone(phone);
                    if (m && !linkedCustomerId) applyCustomer(m);
                  }}
                />
              </Field>

              {phoneMatches.length > 0 && !linkedCustomerId && (
                <div className="flex flex-col gap-2">
                  {phoneMatches.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => applyCustomer(c)}
                      className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-left text-sm hover:border-primary"
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground">{c.phone}</span>
                    </button>
                  ))}
                </div>
              )}

              <Field label="Full name" required>
                <Input className="h-12 text-lg" value={name} onChange={(e) => setName(e.target.value)} placeholder="Devotee name" />
              </Field>

              <Field label="Pincode" required hint="City & state fill automatically">
                <div className="relative">
                  <Input
                    className="h-12 text-lg"
                    maxLength={6}
                    inputMode="numeric"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="6 digits"
                  />
                  {pincodeLoading && (
                    <Loader2 className="absolute right-3 top-1/2 size-5 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                </div>
                {(city || state) && (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {city}{city && state ? ", " : ""}{state}
                  </p>
                )}
              </Field>

              <div>
                <Label className="mb-2 block text-sm font-medium">Purpose</Label>
                <div className="flex flex-wrap gap-2">
                  {BOOKING_PURPOSES.slice(0, 5).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPurpose(p)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium",
                        purpose === p ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                      )}
                    >
                      {p.split(" / ")[0]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPurpose("Other")}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium",
                      purpose === "Other" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                    )}
                  >
                    Other
                  </button>
                </div>
                {purpose === "Other" && (
                  <Input
                    className="mt-2 h-10"
                    value={purposeOther}
                    onChange={(e) => setPurposeOther(e.target.value)}
                    placeholder="Describe purpose"
                  />
                )}
              </div>

              <Collapsible open={showExtra} onOpenChange={setShowExtra}>
                <CollapsibleTrigger className="flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <ChevronDown className={cn("size-4 transition-transform", showExtra && "rotate-180")} />
                  Email & PAN (optional)
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <Input className="h-10" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                  <Input className="h-10 uppercase" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} maxLength={10} placeholder="PAN" />
                </CollapsibleContent>
              </Collapsible>
            </div>

            <Button type="button" size="lg" className="mt-8 h-12 w-full gap-2 text-base" onClick={goStep2}>
              Next — Payment
              <ArrowRight className="size-5" />
            </Button>
          </div>
        )}

        {/* ——— STEP 3: Payment ——— */}
        {step === 3 && draft && (
          <div className="mx-auto w-full max-w-md flex-1 px-4 py-6 sm:px-6">
            <SummaryChip draft={draft} name={name} />

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">Amount to collect</p>
              <p className="mt-1 font-mono text-4xl font-bold tabular-nums">{formatBookingAmount(draft.amount)}</p>
              <p className="mt-2 text-sm text-muted-foreground">{name}</p>
            </div>

            <div className="mt-8 space-y-3">
              <Button type="button" size="lg" className="h-14 w-full text-base font-semibold" onClick={completePaidCash}>
                <Check className="mr-2 size-5" />
                Paid — Cash {formatBookingAmount(draft.amount)}
              </Button>
              <Button type="button" variant="outline" size="lg" className="h-12 w-full" onClick={completePayLater}>
                Pay later (mark enquiry)
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              UPI / Card / partial payment can be recorded from booking details after creation.
            </p>
          </div>
        )}

        {/* ——— Done ——— */}
        {step === "done" && createdId && draft && (
          <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-4 py-10 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-success/15">
              <Check className="size-8 text-success" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Booking saved</h2>
            <p className="mt-1 font-mono text-primary">{formatBookingId(createdId)}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              {draft.serviceName} · {name}
            </p>
            <p className="font-mono text-lg font-semibold">{formatBookingAmount(draft.amount)}</p>
            <div className="mt-8 flex w-full flex-col gap-2 sm:flex-row">
              <Button className="flex-1" onClick={() => navigate("/business-connect/bookings/counter")}>
                All bookings
              </Button>
              <Button className="flex-1" variant="outline" onClick={resetAll}>
                <Sparkles className="mr-2 size-4" />
                New booking
              </Button>
            </div>
          </div>
        )}
      </div>
    </WorkspacePage>
  );
}

function ItemCard({
  selected,
  title,
  subtitle,
  price,
  onClick,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  price: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col rounded-2xl border-2 p-4 text-left transition-all hover:shadow-md",
        selected ? "border-primary bg-primary/[0.06] ring-2 ring-primary/20" : "border-border bg-card hover:border-primary/40",
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3.5" />
        </span>
      )}
      <span className="pr-8 text-base font-semibold leading-snug">{title}</span>
      <span className="mt-1 text-xs text-muted-foreground">{subtitle}</span>
      <span className="mt-3 font-mono text-lg font-bold tabular-nums text-primary">{price}</span>
    </button>
  );
}

function SummaryChip({ draft, name }: { draft: BookingDraft; name?: string }) {
  return (
    <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm">
      <p className="font-medium">{draft.serviceName}</p>
      <p className="mt-0.5 text-muted-foreground">
        {formatBookingDate(draft.scheduledDate)} · {draft.scheduledTime}
        {name ? ` · ${name}` : ""}
        {" · "}
        <span className="font-semibold text-foreground">{formatBookingAmount(draft.amount)}</span>
      </p>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {hint && <p className="mb-1.5 text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}
