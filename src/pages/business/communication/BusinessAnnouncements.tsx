import { useMemo, useState } from "react";
import { Bell, Globe, Megaphone, Plus, Search, Users } from "lucide-react";
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
import { StatusPill } from "@/components/ui/status-pill";
import { FilterStrip, WorkspacePage, WorkspaceStatusBar, WorkspaceTable, type WorkspaceColumnDef } from "@/components/workspace";
import { WORKSPACE_PAGE_SIZE } from "@/components/workspace/tablePagination";
import { announcements, statusTone, type BusinessAnnouncement } from "./communicationData";

export default function BusinessAnnouncements() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return announcements.filter((a) => {
      const matchSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      const matchAudience = audienceFilter === "all" || a.audience === audienceFilter;
      return matchSearch && matchStatus && matchAudience;
    });
  }, [search, statusFilter, audienceFilter]);

  const columns: WorkspaceColumnDef<BusinessAnnouncement>[] = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        colStyle: { width: "6rem" },
        cell: (a) => <span className="font-mono text-[11px] text-primary">{a.id}</span>,
      },
      {
        id: "title",
        header: "Announcement",
        colStyle: { width: "24%" },
        className: "max-w-0 overflow-hidden text-left",
        cell: (a) => (
          <div className="min-w-0 space-y-0.5">
            <p className="cell-primary flex items-center gap-1 font-medium">
              {a.title}
              {a.pinned && <Badge variant="outline" className="text-[9px] px-1 py-0">Pinned</Badge>}
            </p>
            <p className="cell-secondary truncate">{a.summary}</p>
          </div>
        ),
      },
      {
        id: "category",
        header: "Category",
        colStyle: { width: "8rem" },
        cell: (a) => <Badge variant="outline" className="text-[10px]">{a.category}</Badge>,
      },
      {
        id: "audience",
        header: "Audience",
        colStyle: { width: "12%" },
        className: "max-w-0 overflow-hidden text-left",
        cell: (a) => (
          <div className="min-w-0">
            <p className="truncate text-sm">{a.audience}</p>
            {a.segment && <p className="cell-secondary truncate">{a.segment}</p>}
          </div>
        ),
      },
      {
        id: "channels",
        header: "Channels",
        colStyle: { width: "10%" },
        cell: (a) => <span className="text-sm text-muted-foreground">{a.channels.join(", ")}</span>,
      },
      {
        id: "priority",
        header: "Priority",
        colStyle: { width: "6.5rem" },
        cell: (a) => <StatusPill label={a.priority} tone={a.priority === "Urgent" ? "destructive" : a.priority === "Important" ? "warning" : "neutral"} />,
      },
      {
        id: "status",
        header: "Status",
        colStyle: { width: "6.5rem" },
        cell: (a) => <StatusPill label={a.status} tone={statusTone(a.status)} />,
      },
      {
        id: "publish",
        header: "Publish",
        colStyle: { width: "9rem" },
        cell: (a) => <span className="text-sm text-muted-foreground">{a.publishAt}</span>,
      },
      {
        id: "views",
        header: "Views",
        colStyle: { width: "4.5rem" },
        className: "text-center",
        cell: (a) => <span className="font-mono text-xs">{a.views}</span>,
      },
    ],
    [],
  );

  const published = announcements.filter((a) => a.status === "Published").length;
  const scheduled = announcements.filter((a) => a.status === "Scheduled").length;
  const customerFacing = announcements.filter((a) => a.audience === "All Customers" || a.audience === "CRM Segment").length;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage
        eyebrow="Communication Center"
        title="Announcements"
        description="Publish customer notices, promotions, and internal staff updates."
        statusBar={<WorkspaceStatusBar />}
        actions={
          <Button size="sm" className="h-9 gap-1.5 text-xs">
            <Plus className="size-3.5" />
            New Announcement
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-3 px-4 pb-3 md:grid-cols-4">
          {[
            { label: "Published", value: published, icon: Globe },
            { label: "Scheduled", value: scheduled, icon: Bell },
            { label: "Customer-facing", value: customerFacing, icon: Megaphone },
            { label: "Total", value: announcements.length, icon: Users },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg border bg-card p-3">
              <kpi.icon className="mb-1.5 size-4 text-muted-foreground" />
              <p className="text-xl font-bold">{kpi.value}</p>
              <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            </div>
          ))}
        </div>

        <FilterStrip>
          <div className="relative w-72 shrink-0">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search title, category…"
              className="h-7 pl-8 text-xs"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={audienceFilter} onValueChange={(v) => { setAudienceFilter(v); setPage(1); }}>
            <SelectTrigger className="h-7 w-auto min-w-[140px] text-xs">
              <SelectValue placeholder="Audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All audiences</SelectItem>
              <SelectItem value="All Customers">All Customers</SelectItem>
              <SelectItem value="CRM Segment">CRM Segment</SelectItem>
              <SelectItem value="Staff">Staff</SelectItem>
              <SelectItem value="Counter Team">Counter Team</SelectItem>
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
          minWidth="min-w-[1100px]"
          emptyTitle="No announcements found"
          emptyDescription="Create an announcement for customers or your team."
          ariaLabel="Business announcements table"
        />
      </WorkspacePage>
    </div>
  );
}
