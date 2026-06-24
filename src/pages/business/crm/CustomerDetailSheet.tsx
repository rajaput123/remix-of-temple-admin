import { Crown, MessageSquare, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCustomerBookings } from "@/stores/businessCustomerStore";
import type { BusinessCustomer } from "@/types/businessCustomer";
import {
  formatBookingAmount,
  formatBookingDate,
  formatBookingId,
  formatPaymentMode,
} from "../bookings/bookingFormat";
import { bookingStatusTone } from "../bookings/counter/counterBookingConstants";
import { formatCustomerId, formatCustomerLocation, formatCustomerSpend } from "./customerFormat";

const statusTone = {
  Active: "success" as const,
  Lead: "warning" as const,
  Inactive: "neutral" as const,
};

interface CustomerDetailSheetProps {
  customer: BusinessCustomer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/50 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <dt className="shrink-0 text-xs font-medium text-muted-foreground sm:w-36">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm">{children}</dd>
    </div>
  );
}

export function CustomerDetailSheet({ customer, open, onOpenChange }: CustomerDetailSheetProps) {
  if (!customer) return null;

  const bookings = getCustomerBookings(customer);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex flex-wrap items-center gap-2">
            {customer.name}
            {customer.isPremium && (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Crown className="size-3" />
                {customer.premiumTier || "Premium"}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-primary">{formatCustomerId(customer.id)}</span>
            <StatusPill label={customer.status} tone={statusTone[customer.status]} />
            <span className="text-muted-foreground">· {customer.source}</span>
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="h-auto w-full flex-wrap justify-start">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="bookings" className="text-xs">Bookings ({bookings.length})</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs">Reviews</TabsTrigger>
            <TabsTrigger value="comms" className="text-xs">Comm Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border bg-muted/30 p-3 text-center">
                <p className="text-lg font-bold">{customer.totalBookings}</p>
                <p className="text-[10px] text-muted-foreground">Bookings</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-center">
                <p className="text-lg font-bold">{formatCustomerSpend(customer.lifetimeSpend)}</p>
                <p className="text-[10px] text-muted-foreground">Lifetime spend</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-center">
                <p className="text-sm font-bold">{customer.lastBookingDate ? formatBookingDate(customer.lastBookingDate) : "—"}</p>
                <p className="text-[10px] text-muted-foreground">Last booking</p>
              </div>
            </div>

            <dl className="rounded-lg border bg-muted/20 px-4">
              <DetailRow label="Phone">{customer.phone}</DetailRow>
              <DetailRow label="Email">{customer.email || "—"}</DetailRow>
              <DetailRow label="Type">{customer.customerType}{customer.companyName ? ` · ${customer.companyName}` : ""}</DetailRow>
              <DetailRow label="Location">{formatCustomerLocation(customer)}</DetailRow>
              <DetailRow label="Address">{customer.address || "—"}</DetailRow>
              <DetailRow label="PAN">{customer.pan || "—"}</DetailRow>
              {customer.gstin && <DetailRow label="GSTIN">{customer.gstin}</DetailRow>}
            </dl>

            {customer.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {customer.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                ))}
              </div>
            )}

            {customer.notes && (
              <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">{customer.notes}</div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="mt-4">
            {bookings.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No bookings yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{b.serviceName}</p>
                        <p className="text-[11px] text-muted-foreground">{formatBookingId(b.id)} · {formatPaymentMode(b)}</p>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatBookingDate(b.scheduledDate)}
                      </TableCell>
                      <TableCell>
                        <StatusPill label={b.status} tone={bookingStatusTone[b.status]} />
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatBookingAmount(b.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-4 space-y-3">
            {customer.reviews?.length ? (
              customer.reviews.map((r, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, j) => (
                        <Star
                          key={j}
                          className={`size-3 ${j < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{r.date}</span>
                  </div>
                  <p className="text-xs font-medium">{r.serviceName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.content}</p>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No reviews yet</p>
            )}
          </TabsContent>

          <TabsContent value="comms" className="mt-4 space-y-2">
            {customer.commLogs?.length ? (
              customer.commLogs.map((c, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
                  <MessageSquare className="mt-0.5 size-3.5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium">{c.channel}</span>
                      <span className="text-[11px] text-muted-foreground">{c.date}</span>
                    </div>
                    <p className="text-sm">{c.subject}</p>
                    <Badge variant="outline" className="mt-1 text-[10px]">{c.status}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No communication logs</p>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
