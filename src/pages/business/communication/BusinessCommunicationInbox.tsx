import { useMemo, useState } from "react";
import { MessageSquare, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { FilterStrip, WorkspacePage, WorkspaceStatusBar, WorkspaceTable, type WorkspaceColumnDef } from "@/components/workspace";
import { WORKSPACE_PAGE_SIZE } from "@/components/workspace/tablePagination";
import { conversations, statusTone, type BusinessConversation } from "./communicationData";

export default function BusinessCommunicationInbox() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((item) => {
      if (!q) return true;
      return [item.customer, item.company, item.channel, item.latestMessage, item.relatedRecord, item.owner]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [search]);

  const columns: WorkspaceColumnDef<BusinessConversation>[] = [
    {
      id: "customer",
      header: "Customer",
      colStyle: { width: "18%" },
      className: "max-w-0 overflow-hidden text-left",
      cell: (item) => (
        <div className="min-w-0">
          <p className="cell-primary font-medium">{item.customer}</p>
          <p className="cell-secondary truncate">{item.company || item.id}</p>
        </div>
      ),
    },
    { id: "channel", header: "Channel", colStyle: { width: "7rem" }, cell: (item) => item.channel },
    {
      id: "message",
      header: "Latest Message",
      colStyle: { width: "30%" },
      className: "max-w-0 overflow-hidden text-left",
      cell: (item) => <span className="block truncate text-sm text-muted-foreground">{item.latestMessage}</span>,
    },
    {
      id: "record",
      header: "Related Record",
      colStyle: { width: "14%" },
      className: "max-w-0 overflow-hidden text-left",
      cell: (item) => <span className="block truncate text-sm">{item.relatedRecord}</span>,
    },
    { id: "owner", header: "Owner", colStyle: { width: "8rem" }, cell: (item) => item.owner },
    { id: "priority", header: "Priority", colStyle: { width: "6rem" }, cell: (item) => item.priority },
    { id: "status", header: "Status", colStyle: { width: "6rem" }, cell: (item) => <StatusPill label={item.status} tone={statusTone(item.status)} /> },
    { id: "last", header: "Last Activity", colStyle: { width: "8rem" }, cell: (item) => <span className="text-sm text-muted-foreground">{item.lastActivity}</span> },
  ];

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage
        eyebrow="Communication Center"
        title="Inbox"
        description="Customer conversations from WhatsApp, SMS, email, and future push channels."
        statusBar={<WorkspaceStatusBar />}
        actions={<Button size="sm" className="h-9 gap-1.5 text-xs"><Plus className="size-3.5" />New Message</Button>}
      >
        <div className="grid grid-cols-2 gap-3 px-4 pb-3 md:grid-cols-4">
          {[
            { label: "Open", value: conversations.filter((c) => c.status === "Open").length },
            { label: "Waiting", value: conversations.filter((c) => c.status === "Waiting").length },
            { label: "High Priority", value: conversations.filter((c) => c.priority === "High").length },
            { label: "Channels", value: "3" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg border bg-card p-3">
              <MessageSquare className="mb-1.5 size-4 text-muted-foreground" />
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
              placeholder="Search customer, channel, record..."
              className="h-7 pl-8 text-xs"
            />
          </div>
        </FilterStrip>

        <WorkspaceTable
          data={filtered}
          columns={columns}
          rowIdKey="id"
          page={page}
          onPageChange={setPage}
          pageSize={WORKSPACE_PAGE_SIZE}
          minWidth="min-w-[1120px]"
          emptyTitle="No conversations found"
          emptyDescription="Customer conversations will appear here."
          ariaLabel="Business communication inbox"
        />
      </WorkspacePage>
    </div>
  );
}
