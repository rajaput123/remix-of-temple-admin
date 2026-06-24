import { useMemo, useState } from "react";
import { Crown, Inbox, Layers, Plus, Search, SlidersHorizontal, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import { FilterStrip, WorkspacePage, WorkspaceStatusBar, WorkspaceTable, type WorkspaceColumnDef } from "@/components/workspace";
import { WORKSPACE_PAGE_SIZE } from "@/components/workspace/tablePagination";
import { useBusinessCustomers } from "@/stores/businessCustomerStore";
import type { BusinessCustomer } from "@/types/businessCustomer";
import { AddCustomerDialog } from "./AddCustomerDialog";
import { CustomerDetailSheet } from "./CustomerDetailSheet";
import { formatCustomerId, formatCustomerLocation, formatCustomerSpend } from "./customerFormat";
import { formatBookingDate } from "../bookings/bookingFormat";

const TAG_OPTIONS = ["Premium", "Repeat", "New Lead", "Corporate", "High Value", "Wedding"];
const statusTone = {
  Active: "success" as const,
  Lead: "warning" as const,
  Inactive: "neutral" as const,
};

export default function CustomersList() {
  const customers = useBusinessCustomers();
  const [selected, setSelected] = useState<BusinessCustomer | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      const name = c.name || "";
      const phone = c.phone || "";
      const tags = c.tags ?? [];
      const matchSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        (c.email?.toLowerCase().includes(q) ?? false) ||
        (c.companyName?.toLowerCase().includes(q) ?? false) ||
        (c.id || "").toLowerCase().includes(q);
      const tag = tagFilter === "all" || tags.includes(tagFilter);
      const st = statusFilter === "all" || c.status === statusFilter;
      const src = sourceFilter === "all" || c.source === sourceFilter;
      return matchSearch && tag && st && src;
    });
  }, [customers, search, tagFilter, statusFilter, sourceFilter]);

  const columns: WorkspaceColumnDef<BusinessCustomer>[] = useMemo(
    () => [
      {
        id: "id",
        header: (
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">ID</span>
        ),
        colStyle: { width: "5.5rem" },
        className: "max-w-[5.5rem] overflow-hidden text-left",
        cell: (c) => (
          <span className="block truncate font-mono text-[11px] text-primary" title={c.id}>
            {formatCustomerId(c.id)}
          </span>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        colStyle: { width: "18%" },
        className: "text-left max-w-0 overflow-hidden",
        cell: (c) => (
          <div className="min-w-0 space-y-0.5">
            <p className="cell-primary flex items-center gap-1 font-medium">
              {c.name}
              {c.isPremium && <Crown className="size-3 shrink-0 text-amber-500" />}
            </p>
            <p className="cell-secondary truncate">{c.phone}</p>
          </div>
        ),
      },
      {
        id: "company",
        header: "Company",
        colStyle: { width: "14%" },
        className: "max-w-0 overflow-hidden text-left",
        cell: (c) => (
          <div className="min-w-0 space-y-0.5">
            <p className="cell-primary truncate">{c.companyName || "—"}</p>
            <p className="cell-secondary truncate">{c.customerType}</p>
          </div>
        ),
      },
      {
        id: "location",
        header: "Location",
        colStyle: { width: "12%" },
        className: "max-w-0 overflow-hidden text-left",
        cell: (c) => (
          <span className="block truncate text-sm text-muted-foreground">{formatCustomerLocation(c)}</span>
        ),
      },
      {
        id: "tags",
        header: "Tags",
        colStyle: { width: "14%" },
        className: "max-w-0 overflow-hidden text-left",
        cell: (c) => (
          <div className="flex flex-wrap gap-1">
            {(c.tags ?? []).slice(0, 2).map((t) => (
              <Badge key={t} variant="outline" className="text-[9px] px-1 py-0">{t}</Badge>
            ))}
            {(c.tags ?? []).length > 2 && (
              <Badge variant="outline" className="text-[9px] px-1 py-0">+{(c.tags ?? []).length - 2}</Badge>
            )}
            {(c.tags ?? []).length === 0 && <span className="text-xs text-muted-foreground">—</span>}
          </div>
        ),
      },
      {
        id: "bookings",
        header: "Bookings",
        colStyle: { width: "5rem" },
        className: "text-center",
        cell: (c) => <span className="font-mono text-xs">{c.totalBookings}</span>,
      },
      {
        id: "spend",
        header: "Lifetime Spend",
        colStyle: { width: "8rem" },
        headerClassName: "text-right",
        className: "text-right",
        cell: (c) => (
          <span className="font-mono text-xs font-semibold">{formatCustomerSpend(c.lifetimeSpend)}</span>
        ),
      },
      {
        id: "lastBooking",
        header: "Last Booking",
        colStyle: { width: "7.5rem" },
        className: "whitespace-nowrap text-left",
        cell: (c) => (
          <span className="text-sm text-muted-foreground">
            {c.lastBookingDate ? formatBookingDate(c.lastBookingDate) : "—"}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        colStyle: { width: "6rem" },
        className: "text-left",
        cell: (c) => <StatusPill label={c.status || "Active"} tone={statusTone[c.status] ?? "neutral"} />,
      },
      {
        id: "source",
        header: "Source",
        colStyle: { width: "6rem" },
        className: "text-left",
        cell: (c) => <span className="text-sm text-muted-foreground">{c.source}</span>,
      },
    ],
    [],
  );

  const kpis = useMemo(
    () => [
      { label: "Total Customers", value: customers.length, icon: Users },
      { label: "Active", value: customers.filter((c) => c.status === "Active").length, icon: UserCheck },
      { label: "Leads", value: customers.filter((c) => c.status === "Lead").length, icon: Inbox },
      { label: "Premium", value: customers.filter((c) => c.isPremium).length, icon: Crown },
    ],
    [customers],
  );

  const openDetail = (customer: BusinessCustomer) => {
    setSelected(customer);
    setDetailOpen(true);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage
        eyebrow="CRM"
        title="Customers"
        description="Manage customer records, booking history, and relationship notes."
        statusBar={<WorkspaceStatusBar />}
        actions={
          <Button size="sm" className="h-9 gap-1.5 text-xs" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" />
            Add Customer
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-3 px-4 pb-3 md:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-lg border bg-card p-3">
              <kpi.icon className="mb-1.5 size-4 text-muted-foreground" />
              <p className="text-xl font-bold">{kpi.value}</p>
              <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            </div>
          ))}
        </div>

        <FilterStrip>
          <div className="relative w-64 shrink-0">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, phone, company…"
              className="h-7 pl-8 text-xs"
            />
          </div>

          <Select value={tagFilter} onValueChange={(v) => { setTagFilter(v); setPage(1); }}>
            <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
              <Layers className="mr-1.5 size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {TAG_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
              <SlidersHorizontal className="mr-1.5 size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(1); }}>
            <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="Counter">Counter</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
              <SelectItem value="Marketplace">Marketplace</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </FilterStrip>

        <WorkspaceTable
          data={filtered}
          columns={columns}
          rowIdKey="id"
          page={page}
          onPageChange={setPage}
          pageSize={WORKSPACE_PAGE_SIZE}
          onRowClick={openDetail}
          emptyTitle="No customers match your filters"
          emptyDescription="Add a customer or adjust search and filters."
          minWidth="min-w-[1040px]"
          ariaLabel="Customers table"
        />
      </WorkspacePage>

      <CustomerDetailSheet customer={selected} open={detailOpen} onOpenChange={setDetailOpen} />
      <AddCustomerDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
