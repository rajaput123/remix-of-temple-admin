import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { WorkspacePage, WorkspaceStatusBar, WorkspaceTable, type WorkspaceColumnDef } from "@/components/workspace";
import { WORKSPACE_PAGE_SIZE } from "@/components/workspace/tablePagination";
import { statusTone, templates, type BusinessMessageTemplate } from "./communicationData";

export default function BusinessMessageTemplates() {
  const [page, setPage] = useState(1);

  const columns: WorkspaceColumnDef<BusinessMessageTemplate>[] = [
    { id: "id", header: "ID", colStyle: { width: "6rem" }, cell: (item) => <span className="font-mono text-xs text-primary">{item.id}</span> },
    { id: "name", header: "Template", colStyle: { width: "18%" }, className: "text-left", cell: (item) => <span className="font-medium">{item.name}</span> },
    { id: "category", header: "Category", colStyle: { width: "8rem" }, cell: (item) => <Badge variant="secondary" className="text-[10px]">{item.category}</Badge> },
    { id: "channel", header: "Channel", colStyle: { width: "7rem" }, cell: (item) => item.channel },
    { id: "language", header: "Language", colStyle: { width: "7rem" }, cell: (item) => item.language },
    {
      id: "variables",
      header: "Variables",
      colStyle: { width: "28%" },
      className: "max-w-0 overflow-hidden text-left",
      cell: (item) => <span className="block truncate font-mono text-[11px] text-muted-foreground">{item.variables.join(", ")}</span>,
    },
    { id: "approval", header: "Approval", colStyle: { width: "9rem" }, cell: (item) => <StatusPill label={item.approvalStatus} tone={statusTone(item.approvalStatus)} /> },
    { id: "status", header: "Status", colStyle: { width: "7rem" }, cell: (item) => <StatusPill label={item.status} tone={statusTone(item.status)} /> },
  ];

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage
        eyebrow="Communication Center"
        title="Templates"
        description="Reusable business messages with Customer, Service, Booking, Payment, and Branch variables."
        statusBar={<WorkspaceStatusBar />}
        actions={<Button size="sm" className="h-9 gap-1.5 text-xs"><Plus className="size-3.5" />New Template</Button>}
      >
        <div className="grid grid-cols-2 gap-3 px-4 pb-3 md:grid-cols-4">
          {[
            { label: "Templates", value: templates.length },
            { label: "Approved", value: templates.filter((t) => t.approvalStatus === "Approved").length },
            { label: "Pending", value: templates.filter((t) => t.approvalStatus === "Pending Approval").length },
            { label: "Channels", value: new Set(templates.map((t) => t.channel)).size },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg border bg-card p-3">
              <FileText className="mb-1.5 size-4 text-muted-foreground" />
              <p className="text-xl font-bold">{kpi.value}</p>
              <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            </div>
          ))}
        </div>

        <WorkspaceTable
          data={templates}
          columns={columns}
          rowIdKey="id"
          page={page}
          onPageChange={setPage}
          pageSize={WORKSPACE_PAGE_SIZE}
          minWidth="min-w-[1060px]"
          emptyTitle="No templates yet"
          emptyDescription="Create templates for booking, payment, lead, and promotional messages."
          ariaLabel="Business message templates"
        />
      </WorkspacePage>
    </div>
  );
}
