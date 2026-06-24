import { useState } from "react";
import { Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { WorkspacePage, WorkspaceStatusBar, WorkspaceTable, type WorkspaceColumnDef } from "@/components/workspace";
import { WORKSPACE_PAGE_SIZE } from "@/components/workspace/tablePagination";
import { automationRules, statusTone, type BusinessCommunicationRule } from "./communicationData";

export default function BusinessCommunicationRules() {
  const [page, setPage] = useState(1);

  const columns: WorkspaceColumnDef<BusinessCommunicationRule>[] = [
    { id: "id", header: "ID", colStyle: { width: "6rem" }, cell: (item) => <span className="font-mono text-xs text-primary">{item.id}</span> },
    { id: "name", header: "Rule Name", colStyle: { width: "20%" }, className: "text-left", cell: (item) => <span className="font-medium">{item.name}</span> },
    { id: "trigger", header: "Trigger", colStyle: { width: "15%" }, cell: (item) => item.trigger },
    { id: "scope", header: "Scope", colStyle: { width: "14%" }, cell: (item) => item.scope },
    { id: "channel", header: "Channel", colStyle: { width: "7rem" }, cell: (item) => item.channel },
    { id: "template", header: "Template", colStyle: { width: "7rem" }, cell: (item) => <span className="font-mono text-xs">{item.template}</span> },
    { id: "timing", header: "Timing", colStyle: { width: "9rem" }, cell: (item) => item.timing },
    { id: "status", header: "Status", colStyle: { width: "7rem" }, cell: (item) => <StatusPill label={item.status} tone={statusTone(item.status)} /> },
  ];

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage
        eyebrow="Communication Center"
        title="Automations"
        description="Trigger business messages from booking, payment, and CRM events."
        statusBar={<WorkspaceStatusBar />}
        actions={<Button size="sm" className="h-9 gap-1.5 text-xs"><Plus className="size-3.5" />New Rule</Button>}
      >
        <div className="grid grid-cols-2 gap-3 px-4 pb-3 md:grid-cols-4">
          {[
            { label: "Rules", value: automationRules.length },
            { label: "Active", value: automationRules.filter((r) => r.status === "Active").length },
            { label: "Paused", value: automationRules.filter((r) => r.status === "Paused").length },
            { label: "Triggers", value: new Set(automationRules.map((r) => r.trigger)).size },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg border bg-card p-3">
              <Zap className="mb-1.5 size-4 text-muted-foreground" />
              <p className="text-xl font-bold">{kpi.value}</p>
              <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            </div>
          ))}
        </div>

        <WorkspaceTable
          data={automationRules}
          columns={columns}
          rowIdKey="id"
          page={page}
          onPageChange={setPage}
          pageSize={WORKSPACE_PAGE_SIZE}
          minWidth="min-w-[1040px]"
          emptyTitle="No automation rules"
          emptyDescription="Create a rule for booking confirmations, reminders, and payment updates."
          ariaLabel="Business communication automation rules"
        />
      </WorkspacePage>
    </div>
  );
}
