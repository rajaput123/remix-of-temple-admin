import { useState } from "react";
import { ScrollText } from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";
import { WorkspacePage, WorkspaceStatusBar, WorkspaceTable, type WorkspaceColumnDef } from "@/components/workspace";
import { WORKSPACE_PAGE_SIZE } from "@/components/workspace/tablePagination";
import { logs, statusTone, type BusinessMessageLog } from "./communicationData";

export default function BusinessCommunicationLogs() {
  const [page, setPage] = useState(1);

  const columns: WorkspaceColumnDef<BusinessMessageLog>[] = [
    { id: "id", header: "Log ID", colStyle: { width: "6rem" }, cell: (item) => <span className="font-mono text-xs text-primary">{item.id}</span> },
    { id: "message", header: "Message ID", colStyle: { width: "7rem" }, cell: (item) => <span className="font-mono text-xs">{item.messageId}</span> },
    { id: "customer", header: "Customer", colStyle: { width: "16%" }, className: "text-left", cell: (item) => <span className="font-medium">{item.customer}</span> },
    { id: "channel", header: "Channel", colStyle: { width: "7rem" }, cell: (item) => item.channel },
    { id: "recipient", header: "Recipient", colStyle: { width: "16%" }, className: "text-left", cell: (item) => <span className="font-mono text-xs">{item.recipient}</span> },
    { id: "status", header: "Status", colStyle: { width: "7rem" }, cell: (item) => <StatusPill label={item.status} tone={statusTone(item.status)} /> },
    { id: "sent", header: "Sent At", colStyle: { width: "10rem" }, cell: (item) => <span className="text-sm text-muted-foreground">{item.sentAt}</span> },
    { id: "delivered", header: "Delivered At", colStyle: { width: "10rem" }, cell: (item) => <span className="text-sm text-muted-foreground">{item.deliveredAt}</span> },
    { id: "error", header: "Error", colStyle: { width: "16%" }, className: "max-w-0 overflow-hidden text-left", cell: (item) => <span className="block truncate text-sm text-muted-foreground">{item.error || "—"}</span> },
  ];

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage
        eyebrow="Communication Center"
        title="Logs & Delivery"
        description="Audit outbound messages, delivery states, read receipts, and provider failures."
        statusBar={<WorkspaceStatusBar />}
      >
        <div className="grid grid-cols-2 gap-3 px-4 pb-3 md:grid-cols-4">
          {[
            { label: "Total Logs", value: logs.length },
            { label: "Delivered", value: logs.filter((l) => l.status === "Delivered" || l.status === "Read").length },
            { label: "Failed", value: logs.filter((l) => l.status === "Failed").length },
            { label: "Channels", value: new Set(logs.map((l) => l.channel)).size },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg border bg-card p-3">
              <ScrollText className="mb-1.5 size-4 text-muted-foreground" />
              <p className="text-xl font-bold">{kpi.value}</p>
              <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            </div>
          ))}
        </div>

        <WorkspaceTable
          data={logs}
          columns={columns}
          rowIdKey="id"
          page={page}
          onPageChange={setPage}
          pageSize={WORKSPACE_PAGE_SIZE}
          minWidth="min-w-[1120px]"
          emptyTitle="No delivery logs"
          emptyDescription="Message delivery activity will appear here."
          ariaLabel="Business communication delivery logs"
        />
      </WorkspacePage>
    </div>
  );
}
