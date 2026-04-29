"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MoreHorizontal,
  Loader2,
  Eye,
  CheckCircle,
  Trash2,
  Send,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type InvoiceStatus,
  type Currency,
  STATUS_LABELS,
  CURRENCY_LABELS,
} from "@/types";

interface DashboardInvoice {
  id: string;
  invoice_number: string;
  client_name: string;
  total: number;
  currency: Currency;
  issue_date: string;
  status: InvoiceStatus;
  public_share_token: string;
}

type FilterStatus = "all" | InvoiceStatus;

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  paid: "bg-status-paid-bg text-status-paid",
  sent: "bg-status-pending-bg text-status-pending",
  overdue: "bg-status-overdue-bg text-status-overdue",
  draft: "bg-status-draft-bg text-status-draft",
};

const STATUS_DOT: Record<InvoiceStatus, string> = {
  paid: "bg-status-paid",
  sent: "bg-status-pending",
  overdue: "bg-status-overdue",
  draft: "bg-status-draft",
};

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<DashboardInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch(`/api/invoices?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setInvoices(
              data.map((inv: Record<string, unknown>) => ({
                id: inv.id as string,
                invoice_number: inv.invoice_number as string,
                client_name: inv.client_name as string,
                total: Number(inv.total),
                currency: (inv.currency as Currency) || "SAR",
                issue_date: inv.issue_date as string,
                status: inv.status as InvoiceStatus,
                public_share_token: inv.public_share_token as string,
              }))
            );
          }
        }
      } catch {
        // Supabase not connected — show empty state
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    if (filter !== "all" && inv.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.client_name.includes(searchQuery)
      );
    }
    return true;
  });

  const statusCounts = {
    all: invoices.length,
    draft: invoices.filter((i) => i.status === "draft").length,
    sent: invoices.filter((i) => i.status === "sent").length,
    paid: invoices.filter((i) => i.status === "paid").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
  };

  const totalOutstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + i.total, 0);

  const paidThisMonth = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);

  const overdueTotal = invoices
    .filter((i) => i.status === "overdue")
    .reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <Link
          href="/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-btn font-arabic font-medium text-sm hover:bg-accent/90 transition-colors"
        >
          <Plus size={16} strokeWidth={1.5} />
          فاتورة جديدة
        </Link>
        <div className="text-end">
          <h1 className="text-2xl font-arabic font-semibold">الفواتير</h1>
          <p className="text-sm text-muted font-arabic mt-1">
            {invoices.length} فاتورة
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="إجمالي المستحق"
          value={totalOutstanding}
          subtitle={`عبر ${statusCounts.sent + statusCounts.overdue} فواتير`}
        />
        <StatCard
          label="مدفوعة هذا الشهر"
          value={paidThisMonth}
          subtitle={`${statusCounts.paid} فواتير`}
        />
        <StatCard
          label="متأخرة"
          value={overdueTotal}
          subtitle={`${statusCounts.overdue} فواتير تحتاج متابعة`}
          alert
        />
      </div>

      {/* Filters + Search */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search
            size={14}
            strokeWidth={1.5}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم أو عميل..."
            className="pr-9 pl-2 py-2 border border-border rounded-btn text-sm font-arabic bg-white focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-colors w-56"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(
            [
              { key: "draft", label: "مسوّدة" },
              { key: "overdue", label: "متأخرة" },
              { key: "paid", label: "مدفوعة" },
              { key: "sent", label: "قيد الانتظار" },
              { key: "all", label: "الكل" },
            ] as { key: FilterStatus; label: string }[]
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-btn text-xs font-arabic transition-colors",
                filter === f.key
                  ? "bg-foreground text-white"
                  : "bg-white border border-border text-muted hover:text-foreground"
              )}
            >
              {f.label} {statusCounts[f.key]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-card border border-border shadow-card overflow-visible">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-muted" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs text-muted font-arabic">
                <th className="text-end px-6 py-3 font-medium">رقم الفاتورة</th>
                <th className="text-end px-4 py-3 font-medium">العميل</th>
                <th className="text-start px-4 py-3 font-medium">المبلغ</th>
                <th className="text-start px-4 py-3 font-medium">تاريخ الإصدار</th>
                <th className="text-start px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-muted font-arabic">
                    لا توجد فواتير
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border/50 last:border-0 hover:bg-background/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-end">
                      <span className="font-inter text-sm font-medium">
                        {inv.invoice_number}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-end">
                      <span className="font-arabic text-sm font-medium">
                        {inv.client_name}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-start">
                      <span className="font-inter text-sm font-medium">
                        {inv.total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <span className="text-xs text-muted font-arabic ms-1">
                        {CURRENCY_LABELS[inv.currency]?.ar || inv.currency}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-start">
                      <span className="font-inter text-sm text-muted">
                        {inv.issue_date}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-start">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-badge text-xs font-arabic",
                          STATUS_STYLES[inv.status]
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            STATUS_DOT[inv.status]
                          )}
                        />
                        {STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <InvoiceActions
                        invoice={inv}
                        onStatusChange={(id, newStatus) => {
                          setInvoices((prev) =>
                            prev.map((i) =>
                              i.id === id ? { ...i, status: newStatus } : i
                            )
                          );
                        }}
                        onDelete={(id) => {
                          setInvoices((prev) => prev.filter((i) => i.id !== id));
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function InvoiceActions({
  invoice,
  onStatusChange,
  onDelete,
}: {
  invoice: DashboardInvoice;
  onStatusChange: (id: string, status: InvoiceStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    setOpen(false);
    onStatusChange(invoice.id, newStatus);
    try {
      await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Revert on failure could be added
    }
  };

  const handleDelete = async () => {
    setOpen(false);
    onDelete(invoice.id);
    try {
      await fetch(`/api/invoices/${invoice.id}`, { method: "DELETE" });
    } catch {
      // Silent fail — already removed from UI
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1 text-muted hover:text-foreground transition-colors"
      >
        <MoreHorizontal size={16} strokeWidth={1.5} />
      </button>
      {open && (
        <div className="absolute left-0 top-8 z-50 bg-white rounded-btn border border-border shadow-card py-1 w-44">
          <button
            onClick={() => {
              setOpen(false);
              router.push(`/i/${invoice.public_share_token}`);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-arabic text-foreground hover:bg-background transition-colors text-end"
          >
            <Eye size={14} strokeWidth={1.5} className="text-muted" />
            عرض الفاتورة
          </button>
          {invoice.status === "draft" && (
            <button
              onClick={() => handleStatusChange("sent")}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-arabic text-foreground hover:bg-background transition-colors text-end"
            >
              <Send size={14} strokeWidth={1.5} className="text-muted" />
              تحديد كمُرسلة
            </button>
          )}
          {(invoice.status === "sent" || invoice.status === "overdue") && (
            <button
              onClick={() => handleStatusChange("paid")}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-arabic text-foreground hover:bg-background transition-colors text-end"
            >
              <CheckCircle size={14} strokeWidth={1.5} className="text-status-paid" />
              تحديد كمدفوعة
            </button>
          )}
          {(invoice.status === "overdue" || invoice.status === "sent") && (
            <button
              onClick={() => {
                setOpen(false);
                router.push(`/invoices/${invoice.id}/remind`);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-arabic text-foreground hover:bg-background transition-colors text-end"
            >
              <MessageCircle size={14} strokeWidth={1.5} className="text-accent" />
              إرسال تذكير
            </button>
          )}
          <div className="border-t border-border my-1" />
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-arabic text-status-overdue hover:bg-status-overdue-bg transition-colors text-end"
          >
            <Trash2 size={14} strokeWidth={1.5} />
            حذف
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  alert,
}: {
  label: string;
  value: number;
  subtitle: string;
  alert?: boolean;
}) {
  return (
    <div className="bg-white rounded-card border border-border shadow-card p-6">
      <div className="flex items-start justify-between mb-2">
        <div>
          {alert && (
            <span className="w-2 h-2 rounded-full bg-status-overdue inline-block" />
          )}
        </div>
        <p className="text-sm text-muted font-arabic">{label}</p>
      </div>
      <p className="text-3xl font-inter font-bold text-end mb-1">
        {value.toLocaleString("en-US", { minimumFractionDigits: 0 })}
        <span className="text-sm text-muted font-arabic ms-1">ر.س</span>
      </p>
      <p className="text-xs text-muted font-arabic text-end">{subtitle}</p>
    </div>
  );
}
