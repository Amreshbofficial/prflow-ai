"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Users, Mail, Calendar, ArrowRight, Activity } from "lucide-react";
import { analyticsApi, leadsApi } from "@/lib/api";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: analyticsApi.getDashboardStats,
  });

  const { data: leadsData } = useQuery({
    queryKey: ["leads"],
    queryFn: leadsApi.getLeads,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good morning, Amresh</h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your outreach today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI Cards */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Leads</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {statsLoading ? "..." : stats?.total_leads || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">New This Week</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {statsLoading ? "..." : stats?.new_this_week || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Outreach Sent</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {statsLoading ? "..." : stats?.outreach_sent || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">AI Generated</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {statsLoading ? "..." : stats?.ai_generated_messages || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Leads</h3>
            <Link href="/dashboard/leads" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="px-6 py-5">
            {leadsData?.items && leadsData.items.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {leadsData.items.slice(0, 5).map((lead: any) => (
                  <li key={lead.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.company_name}</p>
                      <p className="text-sm text-gray-500">{lead.contact_name}</p>
                    </div>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {lead.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No leads available.</p>
            )}
          </div>
        </div>

        {/* Follow-ups Panel */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
