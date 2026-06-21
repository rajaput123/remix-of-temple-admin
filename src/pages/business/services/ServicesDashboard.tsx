import { ServiceDashboardCharts } from "@/components/service-management/ServiceDashboardCharts";
import { ServiceStatsWidgets } from "@/components/service-management/ServiceStatsWidgets";
import { WorkspacePage } from "@/components/workspace";

export default function ServicesDashboardPage() {
  return (
    <WorkspacePage
      eyebrow="Business Connect · Services"
      title="Dashboard"
      description="KPIs, trends, and distribution across your service catalogue."
      bleed={false}
    >
      <div className="space-y-4 overflow-y-auto p-6">
        <ServiceStatsWidgets />
        <ServiceDashboardCharts />
      </div>
    </WorkspacePage>
  );
}
