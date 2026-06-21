import { useMemo } from "react";
import { KpiCard } from "@/components/workspace/KpiCard";
import { usePackages, useServices } from "@/stores/serviceManagementStore";

export function ServiceStatsWidgets() {
  const services = useServices();
  const packages = usePackages();

  const stats = useMemo(() => {
    const totalViews = services.reduce((sum, s) => sum + s.views, 0);
    const totalEnquiries = services.reduce((sum, s) => sum + s.enquiries, 0);
    const pendingServices = services.filter((s) => s.status === "Draft").length;
    const pendingPackages = packages.filter((p) => p.status === "Draft").length;
    const activeServices = services.filter((s) => s.status === "Active").length;

    return {
      totalServices: services.length,
      activeServices,
      totalViews,
      totalEnquiries,
      queueItems: pendingServices + pendingPackages,
    };
  }, [services, packages]);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <KpiCard
        label="Total Services"
        value={stats.totalServices}
        sub={`${stats.activeServices} active`}
        accent="primary"
      />
      <KpiCard
        label="Total Views"
        value={stats.totalViews.toLocaleString()}
        sub="Across all listings"
        accent="success"
      />
      <KpiCard
        label="Total Enquiries"
        value={stats.totalEnquiries}
        sub="Lead volume"
        accent="success"
      />
      <KpiCard
        label="Queue Items"
        value={stats.queueItems}
        sub="Pending publish"
        accent="warning"
      />
    </div>
  );
}
