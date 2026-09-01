"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { analyticsApi } from "@/lib/api";
import { Users, Mail, Activity, Target, Calendar, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/loading-skeleton";

const COLORS = ['#64748B', '#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: analyticsApi.getDashboardStats,
  });

  const chartData = stats?.chart_data || [];
  const pipelineData = stats?.pipeline_distribution || [];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#4f46e5]/[0.06] via-surface to-surface p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.14),transparent_70%)]" />
        <div className="relative">
          <PageHeader
            title="Analytics & Reporting"
            description="Detailed metrics and insights for your PR outreach campaigns."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={stats?.total_leads || 0}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          title="Outreach Sent"
          value={stats?.outreach_sent || 0}
          icon={Mail}
          isLoading={isLoading}
        />
        <StatCard
          title="Response Rate"
          value={`${stats?.response_rate || 0}%`}
          icon={Target}
          isLoading={isLoading}
        />
        <StatCard
          title="AI Drafts"
          value={stats?.ai_generated_messages || 0}
          icon={Activity}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] flex flex-col transition-shadow hover:shadow-[0_16px_44px_-14px_rgba(15,23,42,0.14)]">
          <div className="px-6 py-5 border-b border-border bg-surface-secondary/40 flex justify-between items-center rounded-t-2xl">
            <h3 className="font-semibold text-text-primary">Outreach Volume</h3>
            <span className="text-xs font-medium text-text-muted bg-surface border border-border px-2.5 py-1 rounded-full flex items-center">
              <Calendar className="h-3 w-3 mr-1" /> Last 7 Days
            </span>
          </div>
          <div className="p-6 h-80 w-full flex-1">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsBarFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: '#F1F5F9' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 12px_28px -10px rgba(15,23,42,0.15)', padding: '12px' }}
                    labelStyle={{ color: '#0F172A', fontWeight: 600, marginBottom: '4px' }}
                  />
                  <Bar dataKey="sent" fill="url(#analyticsBarFill)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted text-sm">
                No outreach data yet. Generate and send outreach to see volume charts.
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] flex flex-col transition-shadow hover:shadow-[0_16px_44px_-14px_rgba(15,23,42,0.14)]">
          <div className="px-6 py-5 border-b border-border bg-surface-secondary/40 flex justify-between items-center rounded-t-2xl">
            <h3 className="font-semibold text-text-primary">Pipeline Distribution</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="h-64 w-full flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="h-full w-full rounded-full" />
              ) : pipelineData.length > 0 && !(pipelineData.length === 1 && pipelineData[0].name === "No Data") ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pipelineData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                    >
                      {pipelineData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: '#0F172A', fontWeight: 500 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-text-muted text-sm">
                  No pipeline data yet. Add leads to see distribution.
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              {pipelineData.map((entry: any, index: number) => (
                <div key={entry.name} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-secondary/50">
                  <div className="flex items-center text-sm font-medium text-text-primary">
                    <span 
                      className="w-3 h-3 rounded-full mr-2.5 shadow-sm" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    {entry.name}
                  </div>
                  <span className="text-sm font-bold text-text-primary">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
