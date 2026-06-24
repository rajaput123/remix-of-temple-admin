import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { WorkspacePage, WorkspaceStatusBar, WorkspaceTable, type WorkspaceColumnDef } from "@/components/workspace";
import { WORKSPACE_PAGE_SIZE } from "@/components/workspace/tablePagination";
import { campaigns, statusTone, type BusinessCampaign } from "./communicationData";

export default function BusinessCampaigns() {
  const [page, setPage] = useState(1);

  const columns: WorkspaceColumnDef<BusinessCampaign>[] = [
    { id: "id", header: "ID", colStyle: { width: "6rem" }, cell: (item) => <span className="font-mono text-xs text-primary">{item.id}</span> },
    { id: "name", header: "Campaign", colStyle: { width: "24%" }, className: "text-left", cell: (item) => <span className="font-medium">{item.name}</span> },
    { id: "segment", header: "Segment", colStyle: { width: "15%" }, cell: (item) => item.segment },
    { id: "channels", header: "Channels", colStyle: { width: "12%" }, cell: (item) => item.channels.join(", ") },
    { id: "status", header: "Status", colStyle: { width: "8rem" }, cell: (item) => <StatusPill label={item.status} tone={statusTone(item.status)} /> },
    { id: "scheduled", header: "Scheduled", colStyle: { width: "10rem" }, cell: (item) => <span className="text-sm text-muted-foreground">{item.scheduledAt}</span> },
    { id: "sent", header: "Sent", colStyle: { width: "5rem" }, className: "text-center", cell: (item) => <span className="font-mono text-xs">{item.sent}</span> },
    { id: "delivered", header: "Delivered", colStyle: { width: "6rem" }, className: "text-center", cell: (item) => <span className="font-mono text-xs">{item.delivered}</span> },
    { id: "failed", header: "Failed", colStyle: { width: "5rem" }, className: "text-center", cell: (item) => <span className="font-mono text-xs">{item.failed}</span> },
  ];

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage
        eyebrow="Communication Center"
        title="Campaigns"
        description="Send targeted promotions and follow-ups to CRM segments."
        statusBar={<WorkspaceStatusBar />}
        actions={<Button size="sm" className="h-9 gap-1.5 text-xs"><Plus className="size-3.5" />Create Campaign</Button>}
      >
        <WorkspaceTable
          data={campaigns}
          columns={columns}
          rowIdKey="id"
          page={page}
          onPageChange={setPage}
          pageSize={WORKSPACE_PAGE_SIZE}
          minWidth="min-w-[980px]"
          emptyTitle="No campaigns yet"
          emptyDescription="Create a campaign to target a customer segment."
          ariaLabel="Business communication campaigns"
        />
      </WorkspacePage>
    </div>
  );
}
