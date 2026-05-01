"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { type InvoiceStatus } from "@/types";

interface DashboardInvoice {
  id: string;
  invoice_number: string;
  client_name: string;
  total: number;
  issue_date: string;
  status: InvoiceStatus;
}

const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const STATUS_COLORS: Record<string, string> = {
  paid: "#16A34A",
  sent: "#525252",
  overdue: "#DC2626",
  draft: "#B45309",
};

const STATUS_LABELS_AR: Record<string, string> = {
  paid: "مدفوعة",
  sent: "قيد الانتظار",
  overdue: "متأخرة",
  draft: "مسوّدة",
};

export function DashboardCharts({ invoices }: { invoices: DashboardInvoice[] }) {
  // Monthly revenue data (last 6 months)
  const monthlyData = getMonthlyRevenue(invoices);

  // Top clients
  const topClients = getTopClients(invoices);

  // Status distribution
  const statusData = getStatusDistribution(invoices);

  if (invoices.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
      {/* Monthly Revenue */}
      <div className="lg:col-span-2 bg-white rounded-card border border-border shadow-card p-6">
        <h3 className="text-sm font-arabic font-semibold text-end mb-4">
          الإيرادات الشهرية
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fontFamily: "var(--font-ibm-plex-arabic)" }}
              stroke="#E5E5E5"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: "var(--font-inter)" }}
              stroke="#E5E5E5"
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                fontFamily: "var(--font-inter)",
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #E5E5E5",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [
                `${Number(value).toLocaleString("en-US")} ر.س`,
                "الإيرادات",
              ]}
            />
            <Bar dataKey="revenue" fill="#0E7C7B" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-card border border-border shadow-card p-6">
        <h3 className="text-sm font-arabic font-semibold text-end mb-4">
          حالة الفواتير
        </h3>
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={60}
              paddingAngle={3}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                fontFamily: "var(--font-ibm-plex-arabic)",
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #E5E5E5",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {statusData.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-[10px] text-muted font-arabic">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Clients */}
      {topClients.length > 0 && (
        <div className="lg:col-span-3 bg-white rounded-card border border-border shadow-card p-6">
          <h3 className="text-sm font-arabic font-semibold text-end mb-4">
            أكبر العملاء
          </h3>
          <div className="space-y-3">
            {topClients.map((client, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-inter text-xs text-muted w-16 text-start">
                  {client.total.toLocaleString("en-US")} ر.س
                </span>
                <div className="flex-1">
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${client.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="font-arabic text-xs font-medium w-32 text-end truncate">
                  {client.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getMonthlyRevenue(invoices: DashboardInvoice[]) {
  const now = new Date();
  const months: { month: string; revenue: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthInvoices = invoices.filter((inv) => {
      return inv.issue_date.startsWith(monthKey) && inv.status === "paid";
    });
    const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
    months.push({
      month: MONTHS_AR[d.getMonth()],
      revenue,
    });
  }

  return months;
}

function getTopClients(invoices: DashboardInvoice[]) {
  const clientMap = new Map<string, number>();
  for (const inv of invoices) {
    const current = clientMap.get(inv.client_name) || 0;
    clientMap.set(inv.client_name, current + inv.total);
  }

  const sorted = Array.from(clientMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxTotal = sorted[0]?.[1] || 1;

  return sorted.map(([name, total]) => ({
    name,
    total,
    percentage: Math.round((total / maxTotal) * 100),
  }));
}

function getStatusDistribution(invoices: DashboardInvoice[]) {
  const counts: Record<string, number> = {};
  for (const inv of invoices) {
    counts[inv.status] = (counts[inv.status] || 0) + 1;
  }

  return Object.entries(counts).map(([status, value]) => ({
    name: STATUS_LABELS_AR[status] || status,
    value,
    color: STATUS_COLORS[status] || "#525252",
  }));
}
