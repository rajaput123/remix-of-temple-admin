import { useMemo, useState } from "react";
import { Filter, Plus, Search, Tag, Users, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterStrip, WorkspacePage, WorkspaceStatusBar, WorkspaceTable, type WorkspaceColumnDef } from "@/components/workspace";
import { WORKSPACE_PAGE_SIZE } from "@/components/workspace/tablePagination";

type SegmentType = "Dynamic" | "Static";

interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  type: SegmentType;
  criteria: string;
  memberCount: number;
  lastCampaign?: string;
}

const SEGMENTS: CustomerSegment[] = [
  {
    id: "seg-001",
    name: "Repeat Customers",
    description: "Customers with 2+ completed bookings",
    type: "Dynamic",
    criteria: "Bookings ≥ 2",
    memberCount: 48,
    lastCampaign: "2026-06-10",
  },
  {
    id: "seg-002",
    name: "High Value",
    description: "Lifetime spend above ₹50,000",
    type: "Dynamic",
    criteria: "Lifetime Spend ≥ ₹50,000",
    memberCount: 12,
    lastCampaign: "2026-06-05",
  },
  {
    id: "seg-003",
    name: "Corporate Accounts",
    description: "B2B customers with company profile",
    type: "Dynamic",
    criteria: "Customer Type = Corporate",
    memberCount: 18,
    lastCampaign: "2026-05-28",
  },
  {
    id: "seg-004",
    name: "Wedding Season",
    description: "Customers tagged for wedding services",
    type: "Dynamic",
    criteria: "Tag = Wedding",
    memberCount: 34,
  },
  {
    id: "seg-005",
    name: "Premium Clients",
    description: "Manually curated premium customer list",
    type: "Static",
    criteria: "Manual selection",
    memberCount: 9,
    lastCampaign: "2026-06-12",
  },
  {
    id: "seg-006",
    name: "Inactive 90 Days",
    description: "No booking in the last 90 days",
    type: "Dynamic",
    criteria: "Last Booking > 90 days",
    memberCount: 27,
  },
  {
    id: "seg-007",
    name: "New Leads",
    description: "Lead status customers not yet converted",
    type: "Dynamic",
    criteria: "Status = Lead",
    memberCount: 15,
    lastCampaign: "2026-06-18",
  },
];

export default function CrmSegments() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SEGMENTS.filter((s) => {
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      const matchType = typeFilter === "all" || s.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [search, typeFilter]);

  const columns: WorkspaceColumnDef<CustomerSegment>[] = useMemo(
    () => [
      {
        id: "id",
        header: (
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">ID</span>
        ),
        colStyle: { width: "5.5rem" },
        cell: (s) => <span className="font-mono text-[11px] text-primary">{s.id.toUpperCase()}</span>,
      },
      {
        id: "name",
        header: "Segment",
        colStyle: { width: "22%" },
        className: "text-left max-w-0 overflow-hidden",
        cell: (s) => (
          <div className="min-w-0 space-y-0.5">
            <p className="cell-primary font-medium">{s.name}</p>
            <p className="cell-secondary truncate">{s.description}</p>
          </div>
        ),
      },
      {
        id: "type",
        header: "Type",
        colStyle: { width: "6rem" },
        cell: (s) => <Badge variant="outline" className="text-[10px]">{s.type}</Badge>,
      },
      {
        id: "criteria",
        header: "Criteria",
        colStyle: { width: "22%" },
        className: "max-w-0 overflow-hidden text-left",
        cell: (s) => <span className="block truncate text-sm text-muted-foreground">{s.criteria}</span>,
      },
      {
        id: "members",
        header: "Members",
        colStyle: { width: "5.5rem" },
        className: "text-center",
        cell: (s) => <span className="font-mono text-xs font-semibold">{s.memberCount}</span>,
      },
      {
        id: "lastCampaign",
        header: "Last Campaign",
        colStyle: { width: "8rem" },
        cell: (s) => (
          <span className="text-sm text-muted-foreground">{s.lastCampaign || "—"}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage eyebrow="CRM" title="Segments"
        description="Group customers for targeted campaigns and follow-ups."
        statusBar={<WorkspaceStatusBar />}
        actions={
          <Button size="sm" className="h-9 gap-1.5 text-xs">
            <Plus className="size-3.5" />
            Create Segment
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-3 px-4 pb-3 md:grid-cols-4">
          {[
            { label: "Total Segments", value: SEGMENTS.length, icon: UsersRound },
            { label: "Dynamic", value: SEGMENTS.filter((s) => s.type === "Dynamic").length, icon: Filter },
            { label: "Static", value: SEGMENTS.filter((s) => s.type === "Static").length, icon: Tag },
            { label: "Total Reach", value: SEGMENTS.reduce((a, s) => a + s.memberCount, 0), icon: Users },
          ].map((kpi) => (
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
              placeholder="Search segments…"
              className="h-7 pl-8 text-xs"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
              <Filter className="mr-1.5 size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Dynamic">Dynamic</SelectItem>
              <SelectItem value="Static">Static</SelectItem>
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
          emptyTitle="No segments found"
          emptyDescription="Create a segment to target customer groups."
          minWidth="min-w-[800px]"
          ariaLabel="Customer segments table"
        />
      </WorkspacePage>
    </div>
  );
}
