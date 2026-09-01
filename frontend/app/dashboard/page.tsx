"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Users, Mail, Activity, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { analyticsApi, leadsApi, usersApi } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/loading-skeleton";

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const AVATAR_TONES = [
  "from-[#4f46e5] to-[#6366f1]",
  "from-[#7c3aed] to-[#a855f7]",
  "from-[#0ea5e9] to-[#38bdf8]",
  "from-[#10b981] to-[#34d399]",
  "from-[#f59e0b] to-[#fbbf24]",
];

export default function DashboardPage() {
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: usersApi.getProfile,
    staleTime: 1000 * 60 * 5,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: analyticsApi.getDashboardStats,
  });

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: leadsApi.getLeads,
  });

  const chartData = stats?.chart_data || [];
  const firstName = userProfile?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#4f46e5]/[0.06] via-surface to-surface p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.14),transparent_70%)]" />
        <div className="relative">
          <PageHeader
            title={`${getGreeting()}, ${firstName}`}
            description="Here's what's happening with your outreach today."
          >
            <Link
              href="/dashboard/leads/new"
              className="group inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:from-[#4338ca] hover:to-[#4f46e5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20 active:scale-[0.99]"
            >
              Add New Lead
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </PageHeader>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={stats?.total_leads || 0}
          icon={Users}
          isLoading={statsLoading}
        />
        <StatCard
          title="New This Week"
          value={stats?.new_this_week || 0}
          icon={TrendingUp}
          isLoading={statsLoading}
        />
        <StatCard
          title="Outreach Sent"
          value={stats?.outreach_sent || 0}
          icon={Mail}
          isLoading={statsLoading}
        />
        <StatCard
          title="AI Generated"
          value={stats?.ai_generated_messages || 0}
          icon={Activity}
          isLoading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-surface shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] rounded-2xl border border-border p-6 flex flex-col transition-shadow hover:shadow-[0_16px_44px_-14px_rgba(15,23,42,0.14)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Outreach Activity</h3>
              <p className="text-sm text-text-secondary mt-1">Number of emails sent over the last 7 days</p>
            </div>
            <Link href="/dashboard/analytics" className="text-sm font-medium text-primary hover:text-primary-hover flex items-center transition-colors">
              Full Analytics <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="p-6 flex-1 min-h-0">
            {statsLoading ? (
              <Skeleton className="h-full w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: '#F1F5F9' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 12px 28px -10px rgba(15,23,42,0.15)' }}
                  />
                  <Bar dataKey="sent" fill="url(#barFill)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted text-sm">
                No outreach data yet. Generate some outreach to see activity here.
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] rounded-2xl border border-border flex flex-col transition-shadow hover:shadow-[0_16px_44px_-14px_rgba(15,23,42,0.14)]">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Recent Leads
            </h3>
            <Link href="/dashboard/leads" className="text-sm font-medium text-primary hover:text-primary-hover flex items-center transition-colors">
              View all
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            {leadsLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : leadsData?.items && leadsData.items.length > 0 ? (
              <ul className="divide-y divide-border">
                {leadsData.items.slice(0, 5).map((lead: any, index: number) => (
                  <li key={lead.id} className="p-6 hover:bg-surface-secondary/50 transition-colors group">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_TONES[index % AVATAR_TONES.length]} text-[11px] font-semibold text-white shadow-sm`}
                      >
                        {getInitials(lead.company_name)}
                      </div>
                      <div className="flex flex-1 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link href={`/dashboard/leads/${lead.id}`} className="block truncate text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                            {lead.company_name}
                          </Link>
                          <p className="text-sm text-text-secondary mt-1 truncate">{lead.contact_name}</p>
                        </div>
                        <StatusBadge status={lead.status} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center">
                <p className="text-text-muted text-sm">No leads yet. Add your first lead to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
