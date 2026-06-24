import { useMemo } from "react";
import {
  Activity,
  Calendar,
  Crown,
  IndianRupee,
  MapPin,
  TrendingUp,
  Users,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkspacePage, WorkspaceStatusBar } from "@/components/workspace";
import { useBusinessCustomers } from "@/stores/businessCustomerStore";
import { formatCustomerSpend } from "./customerFormat";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const growthTrend = [
  { month: "Jan", customers: 42, newLeads: 8 },
  { month: "Feb", customers: 48, newLeads: 10 },
  { month: "Mar", customers: 55, newLeads: 12 },
  { month: "Apr", customers: 61, newLeads: 9 },
  { month: "May", customers: 68, newLeads: 11 },
  { month: "Jun", customers: 74, newLeads: 14 },
];

const sourceBreakdown = [
  { name: "Online", value: 38, color: "hsl(217, 91%, 60%)" },
  { name: "Counter", value: 28, color: "hsl(142, 71%, 45%)" },
  { name: "Referral", value: 18, color: "hsl(38, 92%, 50%)" },
  { name: "WhatsApp", value: 10, color: "hsl(16, 85%, 45%)" },
  { name: "Marketplace", value: 6, color: "hsl(0, 0%, 70%)" },
];

const bookingTrend = [
  { month: "Jan", bookings: 28, revenue: 1.2 },
  { month: "Feb", bookings: 35, revenue: 1.8 },
  { month: "Mar", bookings: 42, revenue: 2.1 },
  { month: "Apr", bookings: 38, revenue: 1.9 },
  { month: "May", bookings: 51, revenue: 2.6 },
  { month: "Jun", bookings: 47, revenue: 2.4 },
];

export default function CrmInsights() {
  const customers = useBusinessCustomers();

  const topCustomers = useMemo(
    () => [...customers].sort((a, b) => b.lifetimeSpend - a.lifetimeSpend).slice(0, 5),
    [customers],
  );

  const totalSpend = customers.reduce((a, c) => a + c.lifetimeSpend, 0);
  const activeCount = customers.filter((c) => c.status === "Active").length;
  const leadCount = customers.filter((c) => c.status === "Lead").length;
  const premiumCount = customers.filter((c) => c.isPremium).length;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <WorkspacePage eyebrow="CRM" title="Insights"
        description="Customer growth, revenue contribution, and engagement trends."
        statusBar={<WorkspaceStatusBar />}
      >
        <div className="space-y-4 px-4 pb-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Total Customers", value: customers.length.toString(), icon: Users },
              { label: "Active", value: activeCount.toString(), icon: UserCheck },
              { label: "New Leads", value: leadCount.toString(), icon: TrendingUp },
              { label: "Lifetime Revenue", value: formatCustomerSpend(totalSpend), icon: IndianRupee },
            ].map((kpi) => (
              <Card key={kpi.label}>
                <CardContent className="p-4">
                  <kpi.icon className="mb-2 size-4 text-muted-foreground" />
                  <p className="text-xl font-bold">{kpi.value}</p>
                  <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="size-4 text-primary" />
                  Customer Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={growthTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="customers" stroke="hsl(16, 85%, 23%)" strokeWidth={2} name="Customers" />
                    <Line type="monotone" dataKey="newLeads" stroke="hsl(217, 91%, 60%)" strokeWidth={2} name="New Leads" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="size-4 text-primary" />
                  Acquisition Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={sourceBreakdown} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value">
                      {sourceBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">
                  {sourceBreakdown.map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{s.name}</span>
                      <span className="font-medium">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="size-4 text-primary" />
                  Bookings & Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={bookingTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="hsl(16, 85%, 23%)" radius={[3, 3, 0, 0]} name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="size-4 text-primary" />
                  Customer Mix
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-lg bg-muted/40 p-4 text-center">
                  <p className="text-2xl font-bold">{activeCount}</p>
                  <p className="text-[11px] text-muted-foreground">Active</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-4 text-center">
                  <p className="text-2xl font-bold">{leadCount}</p>
                  <p className="text-[11px] text-muted-foreground">Leads</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-4 text-center">
                  <p className="text-2xl font-bold">{premiumCount}</p>
                  <p className="text-[11px] text-muted-foreground">Premium</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="size-4 text-amber-600" />
                Top Customers by Lifetime Spend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-center">Bookings</TableHead>
                    <TableHead className="text-right">Lifetime Spend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.phone}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.companyName || "—"}</TableCell>
                      <TableCell className="text-center text-sm">{c.totalBookings}</TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium">
                        {formatCustomerSpend(c.lifetimeSpend)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </WorkspacePage>
    </div>
  );
}
