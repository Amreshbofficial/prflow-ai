"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Building, Download, Upload, MoreHorizontal, ArrowRight } from "lucide-react";
import { leadsApi } from "@/lib/api";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ImportModal } from "@/components/ui/import-modal";
import { useToast } from "@/components/ui/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function LeadsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["leads"],
    queryFn: leadsApi.getLeads,
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: (string | number)[]) => {
      await Promise.all(ids.map(id => leadsApi.delete(id)));
    },
    onSuccess: () => {
      toast({
        type: "success",
        title: "Leads Deleted",
        description: "Selected leads have been removed.",
      });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Delete Failed",
        description: "Failed to delete selected leads.",
      });
    }
  });

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} lead(s)?`)) {
      deleteMutation.mutate(Array.from(selectedIds));
    }
  };

  // Filter logic
  const items = data?.items || [];
  const filteredItems = items.filter((lead: any) => {
    const matchesSearch = 
      lead.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contact_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "All Statuses" || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedIds(new Set(filteredItems.map((item: any) => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string | number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const columns = [
    {
      header: "Company",
      accessor: (lead: any) => (
        <div>
          <div className="font-medium text-text-primary">{lead.company_name}</div>
          <div className="text-text-muted mt-0.5">{lead.website || "No website"}</div>
        </div>
      )
    },
    {
      header: "Contact",
      accessor: (lead: any) => (
        <div>
          <div className="text-text-primary">{lead.contact_name}</div>
          <div className="text-text-muted mt-0.5">{lead.contact_email}</div>
        </div>
      )
    },
    {
      header: "Industry",
      accessor: "industry",
      className: "text-text-secondary"
    },
    {
      header: "Status",
      accessor: (lead: any) => <StatusBadge status={lead.status} />
    },
    {
      header: "",
      accessor: (lead: any) => (
        <div className="flex justify-end">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/leads/${lead.id}`);
            }}
            className="text-text-muted hover:text-primary transition-colors p-2 rounded-md hover:bg-surface-secondary"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
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
            title="Leads"
            description="Manage your PR prospects, journalists, and company information."
          >
            <button
              onClick={() => setIsImportOpen(true)}
              className="hidden sm:inline-flex items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20 shadow-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
            <button
              onClick={() => toast({ type: 'info', title: 'Coming Soon', description: 'Export functionality is not yet available.' })}
              className="hidden sm:inline-flex items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20 shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <Link
              href="/dashboard/leads/new"
              className="group inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:from-[#4338ca] hover:to-[#4f46e5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20 active:scale-[0.99]"
            >
              <Plus className="h-4 w-4" />
              Add Lead
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </PageHeader>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] overflow-hidden flex flex-col transition-shadow hover:shadow-[0_16px_44px_-14px_rgba(15,23,42,0.14)]">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-secondary/40">
          <div className="w-full max-w-sm">
            <SearchInput
              placeholder="Search leads by name or company..."
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
              <option value="New">New</option>
              <option value="Researching">Researching</option>
              <option value="Contacted">Contacted</option>
              <option value="Replied">Replied</option>
              <option value="Qualified">Qualified</option>
            </select>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="bg-[#4f46e5]/[0.04] border-b border-[#4f46e5]/10 px-6 py-3 flex items-center justify-between animate-in slide-in-from-top-2">
            <span className="text-sm font-semibold text-primary">
              {selectedIds.size} lead{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                disabled={deleteMutation.isPending}
                className="text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Selected"}
              </button>
              <button
                onClick={() => toast({ type: 'info', title: 'Coming Soon', description: 'Bulk update functionality is not yet available.' })}
                className="text-xs font-semibold text-primary hover:text-primary-hover px-3 py-1.5 rounded-lg bg-white shadow-sm transition-colors border border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/30"
              >
                Bulk Update
              </button>
            </div>
          </div>
        )}

        <DataTable
          data={filteredItems}
          columns={columns}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onRowClick={(row) => router.push(`/dashboard/leads/${row.id}`)}
          emptyState={
            <EmptyState
              icon={Building}
              title="No leads found"
              description={searchQuery || statusFilter !== "All Statuses" ? "Try adjusting your filters or search query." : "Get started by adding your first PR lead or importing a list."}
              className="border-0 rounded-none border-b border-border bg-transparent"
              action={
                <Link
                  href="/dashboard/leads/new"
                  className="group inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 hover:from-[#4338ca] hover:to-[#4f46e5] transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20"
                >
                  <Plus className="h-4 w-4" />
                  Add Lead
                </Link>
              }
            />
          }
          page={1}
          totalPages={Math.ceil(filteredItems.length / 10) || 1}
        />
      </div>

      <ImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
