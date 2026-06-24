import { useMemo, useState } from "react";
import { Bell, CheckCheck, Megaphone, Search, Zap } from "lucide-react";
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
import { notifications, type BusinessNotification } from "./communicationData";

export default function BusinessNotifications() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState(notifications);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((n) => {
      const matchSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.source.toLowerCase().includes(q);
      const matchType = typeFilter === "all" || n.type === typeFilter;
      const matchRead =
        readFilter === "all" ||
        (readFilter === "unread" && !n.read) ||
        (readFilter === "read" && n.read);
      return matchSearch && matchType && matchRead;
    });
  }, [items, search, typeFilter, readFilter]);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const columns: WorkspaceColumnDef<BusinessNotification>[] = useMemo(
    () => [
      {
        id: "status",
        header: "",
        colStyle: { width: "2rem" },
        className: "text-center",
        cell: (n) => (
          <span
            className={`inline-block size-2 rounded-full ${n.read ? "bg-muted-foreground/30" : "bg-primary"}`}
            aria-hidden
          />
        ),
      },
      {
        id: "title",
        header: "Notification",
        colStyle: { width: "28%" },
        className: "max-w-0 overflow-hidden text-left",
        cell: (n) => (
          <div className="min-w-0 space-y-0.5">
            <p className={`cell-primary font-medium ${n.read ? "text-muted-foreground" : ""}`}>{n.title}</p>
            <p className="cell-secondary truncate">{n.message}</p>
          </div>
        ),
      },
      {
        id: "type",
        header: "Type",
        colStyle: { width: "7rem" },
        cell: (n) => <Badge variant="outline" className="text-[10px]">{n.type}</Badge>,
      },
      {
        id: "source",
        header: "Source",
        colStyle: { width: "12%" },
        className: "max-w-0 overflow-hidden text-left",
        cell: (n) => <span className="block truncate text-sm text-muted-foreground">{n.source}</span>,
      },
      {
        id: "priority",
        header: "Priority",
        colStyle: { width: "6rem" },
        cell: (n) => (
          <StatusPill
            label={n.priority}
            tone={n.priority === "High" ? "destructive" : "neutral"}
          />
        ),
      },
      {
        id: "time",
        header: "When",
        colStyle: { width: "9rem" },
        cell: (n) => <span className="text-sm text-muted-foreground">{n.createdAt}</span>,
      },
    ],
    [],
  );

  const unread = items.filter((n) => !n.read).length;
  const highPriority = items.filter((n) => n.priority === "High" && !n.read).length;
  const deliveryAlerts = items.filter((n) => n.type === "Delivery").length;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage
        eyebrow="Communication Center"
        title="Notifications"
        description="Delivery alerts, campaign updates, automation triggers, and system notices."
        statusBar={<WorkspaceStatusBar />}
        actions={
          <Button size="sm" variant="outline" className="h-9 gap-1.5 text-xs" onClick={markAllRead}>
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-3 px-4 pb-3 md:grid-cols-4">
          {[
            { label: "Unread", value: unread, icon: Bell },
            { label: "High priority", value: highPriority, icon: Zap },
            { label: "Delivery alerts", value: deliveryAlerts, icon: Megaphone },
            { label: "Total", value: items.length, icon: CheckCheck },
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
              placeholder="Search notifications…"
              className="h-7 pl-8 text-xs"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Delivery">Delivery</SelectItem>
              <SelectItem value="Campaign">Campaign</SelectItem>
              <SelectItem value="Automation">Automation</SelectItem>
              <SelectItem value="Booking">Booking</SelectItem>
              <SelectItem value="Template">Template</SelectItem>
              <SelectItem value="System">System</SelectItem>
            </SelectContent>
          </Select>
          <Select value={readFilter} onValueChange={(v) => { setReadFilter(v); setPage(1); }}>
            <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
              <SelectValue placeholder="Read status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
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
          minWidth="min-w-[900px]"
          emptyTitle="No notifications"
          emptyDescription="Alerts from campaigns, automations, and delivery logs appear here."
          ariaLabel="Business notifications table"
        />
      </WorkspacePage>
    </div>
  );
}
