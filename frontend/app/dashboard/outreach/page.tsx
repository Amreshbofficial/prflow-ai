"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Edit, Bot, Filter, Search, ArrowRight, Send } from "lucide-react";
import { outreachApi } from "@/lib/api";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";

export default function OutreachPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  const { data: messages, isLoading, error, refetch } = useQuery({
    queryKey: ["outreach-messages"],
    queryFn: outreachApi.getOutreachMessages,
  });

  const sendMutation = useMutation({
    mutationFn: (id: number) => outreachApi.send(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["outreach-messages"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({
        type: "success",
        title: "Email Sent",
        description: "The outreach email has been sent successfully.",
      });
    },
    onError: (err: Error) => {
      toast({
        type: "error",
        title: "Send Failed",
        description: err.message || "Failed to send email. Please try again.",
      });
    },
  });

  const items = messages || [];
  const filteredItems = items.filter((msg: any) => {
    const matchesSearch = msg.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All Statuses" || msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: "Subject & Lead",
      accessor: (msg: any) => (
        <div>
          <div className="font-medium text-text-primary">{msg.subject || "No Subject"}</div>
          <div className="text-text-muted mt-0.5 text-xs">Lead ID: {msg.lead_id}</div>
        </div>
      ),
      className: "w-2/5"
    },
    {
      header: "Channel",
      accessor: (msg: any) => (
        <span className="inline-flex items-center rounded-md bg-surface-secondary px-2.5 py-1 text-xs font-medium text-text-primary border border-border">
          {msg.channel}
        </span>
      )
    },
    {
      header: "Status",
      accessor: (msg: any) => <StatusBadge status={msg.status} />
    },
    {
      header: "AI Generated",
      accessor: (msg: any) => (
        msg.ai_generated ? (
          <div className="flex items-center text-primary text-sm font-medium">
            <Bot className="h-4 w-4 mr-1.5" /> Yes
          </div>
        ) : (
          <div className="text-text-muted text-sm">No</div>
        )
      )
    },
    {
      header: "",
      accessor: (msg: any) => (
        <div className="flex justify-end gap-2">
          {(msg.status === "Draft" || msg.status === "Failed") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                sendMutation.mutate(msg.id);
              }}
              disabled={sendMutation.isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </button>
          )}
          <Link
            href={`/dashboard/outreach/${msg.id}/edit`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Link>
        </div>
      ),
      className: "text-right"
    }
  ];

  if (error) {
    return (
      <div className="w-full mt-8">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Hero header band */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#4f46e5]/[0.06] via-surface to-surface p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.14),transparent_70%)]" />
        <div className="relative">
          <PageHeader
            title="Outreach Drafts"
            description="Manage your AI-generated and manually edited outreach messages."
          />
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] overflow-hidden flex flex-col transition-shadow hover:shadow-[0_16px_44px_-14px_rgba(15,23,42,0.14)]">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-secondary/40">
          <div className="w-full max-w-sm">
            <SearchInput
              placeholder="Search by subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full sm:w-48 pl-3 pr-10 py-2 text-sm border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] rounded-xl transition-colors text-text-primary shadow-sm"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Ready">Ready</option>
              <option value="Sent">Sent</option>
              <option value="Approved">Approved</option>
            </select>
          </div>
        </div>

        <DataTable
          data={filteredItems}
          columns={columns}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          onRowClick={(row) => router.push(`/dashboard/outreach/${row.id}/edit`)}
          emptyState={
            <EmptyState
              icon={MessageSquare}
              title="No outreach messages found"
              description={searchQuery || statusFilter !== "All Statuses" ? "Try adjusting your filters or search query." : "Generate outreach from the Leads section to get started."}
              className="border-0 rounded-none border-b border-border bg-transparent"
              action={
                <Link
                  href="/dashboard/leads"
                  className="group inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 hover:from-[#4338ca] hover:to-[#4f46e5] transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20"
                >
                  View Leads
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              }
            />
          }
          page={1}
          totalPages={Math.ceil(filteredItems.length / 10) || 1}
        />
      </div>
    </div>
  );
}
