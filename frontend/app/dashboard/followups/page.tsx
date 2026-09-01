"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Calendar, CalendarPlus, Clock, ArrowRight, User, Trash2, AlarmClock } from "lucide-react";
import { followupsApi } from "@/lib/api";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { CreateFollowupModal } from "@/components/ui/create-modal";

export default function FollowupsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [snoozeId, setSnoozeId] = useState<number | null>(null);
  const [snoozeDate, setSnoozeDate] = useState("");

  const { data: followups, isLoading, error } = useQuery({
    queryKey: ["followups"],
    queryFn: followupsApi.getFollowups,
  });

  const completeMutation = useMutation({
    mutationFn: followupsApi.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({
        type: "success",
        title: "Task Completed",
        description: "Follow-up marked as completed successfully.",
      });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        description: "Failed to mark follow-up as completed.",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: followupsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({
        type: "success",
        title: "Task Deleted",
        description: "Follow-up has been deleted.",
      });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        description: "Failed to delete follow-up.",
      });
    }
  });

  const snoozeMutation = useMutation({
    mutationFn: ({ id, newDueAt }: { id: number; newDueAt: string }) => followupsApi.snooze(id, newDueAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      setSnoozeId(null);
      setSnoozeDate("");
      toast({
        type: "success",
        title: "Task Rescheduled",
        description: "Follow-up has been rescheduled.",
      });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        description: "Failed to reschedule follow-up.",
      });
    }
  });

  const pendingFollowups = followups?.filter((f: any) => f.status !== "Completed") || [];
  const completedFollowups = followups?.filter((f: any) => f.status === "Completed") || [];
  const displayedFollowups = activeTab === "pending" ? pendingFollowups : completedFollowups;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Hero header band */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#4f46e5]/[0.06] via-surface to-surface p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.14),transparent_70%)]" />
        <div className="relative">
          <PageHeader
            title="Follow-ups & Tasks"
            description="Manage your scheduled outreach follow-ups and stay on top of your PR pipeline."
          >
            <button
              onClick={() => setIsCreateOpen(true)}
              className="group inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:from-[#4338ca] hover:to-[#4f46e5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20 active:scale-[0.99]"
            >
              <CalendarPlus className="h-4 w-4" />
              Schedule Task
            </button>
          </PageHeader>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] overflow-hidden transition-shadow hover:shadow-[0_16px_44px_-14px_rgba(15,23,42,0.14)]">
        {/* Tabs */}
        <div className="border-b border-border bg-surface-secondary/30">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("pending")}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2",
                activeTab === "pending"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary hover:border-border-strong"
              )}
            >
              <span>Pending Tasks</span>
              {pendingFollowups.length > 0 && (
                <span className={cn(
                  "py-0.5 px-2 rounded-full text-xs font-semibold",
                  activeTab === "pending" ? "bg-primary-soft text-primary" : "bg-surface-secondary text-text-secondary"
                )}>
                  {pendingFollowups.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === "completed"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary hover:border-border-strong"
              )}
            >
              Completed
            </button>
          </nav>
        </div>
        
        <div className="p-0">
          {isLoading ? (
            <div className="divide-y divide-border">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-6 flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full max-w-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-error text-sm">Error loading follow-ups. Please refresh the page.</div>
          ) : displayedFollowups.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={activeTab === "pending" ? "You're all caught up!" : "No completed tasks yet"}
              description={activeTab === "pending" ? "There are no pending follow-ups scheduled for today." : "When you complete tasks, they will appear here."}
              className="border-0 rounded-none bg-transparent"
              action={
                activeTab === "pending" ? (
                  <Link
                    href="/dashboard/leads"
                    className="inline-flex items-center px-4 py-2 border border-border shadow-sm text-sm font-medium rounded-md text-text-primary bg-surface hover:bg-surface-secondary transition-colors"
                  >
                    View Leads
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {displayedFollowups.map((followup: any) => {
                const isOverdue = new Date(followup.due_at) < new Date() && followup.status !== "Completed";
                const isSnoozing = snoozeId === followup.id;
                
                return (
                  <li key={followup.id} className="p-6 hover:bg-surface-secondary/30 transition-colors group">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-1">
                          {followup.status === 'Completed' ? (
                            <div className="h-8 w-8 rounded-full bg-success-soft border border-success/20 flex items-center justify-center">
                              <Check className="h-4 w-4 text-success" />
                            </div>
                          ) : (
                            <div className={cn(
                              "h-8 w-8 rounded-full border flex items-center justify-center",
                              isOverdue ? "bg-error-soft border-error/20" : "bg-warning-soft border-warning/20"
                            )}>
                              <Calendar className={cn(
                                "h-4 w-4",
                                isOverdue ? "text-error" : "text-warning-strong"
                              )} />
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-base font-semibold text-text-primary truncate">
                              {followup.lead ? followup.lead.company_name : `Lead ID: ${followup.lead_id}`}
                            </h4>
                            {followup.status === 'Completed' ? (
                              <StatusBadge status="Completed" />
                            ) : isOverdue ? (
                              <span className="inline-flex items-center rounded-md bg-error-soft px-2 py-0.5 text-xs font-medium text-error border border-error/10">
                                Overdue
                              </span>
                            ) : null}
                          </div>
                          
                          {followup.lead && (
                            <div className="flex items-center text-sm text-text-muted mb-2">
                              <User className="h-3.5 w-3.5 mr-1" />
                              {followup.lead.contact_name}
                            </div>
                          )}
                          
                          <p className="text-sm text-text-secondary mb-3 bg-surface border border-border p-3 rounded-lg shadow-sm">
                            {followup.note || "No specific note provided for this follow-up."}
                          </p>
                          
                          <div className="flex items-center text-xs text-text-muted font-medium">
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                            Due: {new Date(followup.due_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pl-12 sm:pl-0">
                        {followup.status !== 'Completed' ? (
                          <>
                            <button
                              onClick={() => completeMutation.mutate(followup.id)}
                              disabled={completeMutation.isPending}
                              className="group inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:from-[#4338ca] hover:to-[#4f46e5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 w-full sm:w-auto"
                            >
                              <Check className="h-4 w-4" /> Mark Done
                            </button>
                            
                            {!isSnoozing ? (
                              <button
                                onClick={() => {
                                  setSnoozeId(followup.id);
                                  // Default snooze: tomorrow
                                  const tomorrow = new Date();
                                  tomorrow.setDate(tomorrow.getDate() + 1);
                                  tomorrow.setHours(9, 0, 0, 0);
                                  setSnoozeDate(tomorrow.toISOString().slice(0, 16));
                                }}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors w-full sm:w-auto"
                              >
                                <AlarmClock className="h-3.5 w-3.5" /> Reschedule
                              </button>
                            ) : (
                              <div className="flex flex-col gap-2 w-full">
                                <input
                                  type="datetime-local"
                                  value={snoozeDate}
                                  onChange={(e) => setSnoozeDate(e.target.value)}
                                  className="block w-full rounded-lg border border-border bg-surface px-2 py-1 text-xs text-text-primary focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/20 shadow-sm outline-none"
                                />
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => snoozeMutation.mutate({ id: followup.id, newDueAt: new Date(snoozeDate).toISOString() })}
                                    disabled={snoozeMutation.isPending || !snoozeDate}
                                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-[#4f46e5] px-2 py-1 text-xs font-semibold text-white hover:bg-[#4338ca] disabled:opacity-50"
                                  >
                                    <Check className="h-3 w-3" /> Save
                                  </button>
                                  <button
                                    onClick={() => { setSnoozeId(null); setSnoozeDate(""); }}
                                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface-secondary"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this follow-up?")) {
                                  deleteMutation.mutate(followup.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-error/20 bg-error-soft/50 px-3 py-1.5 text-xs font-semibold text-error hover:bg-error-soft hover:border-error/30 transition-colors w-full sm:w-auto disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-sm text-text-muted">
                            Completed
                          </span>
                        )}
                        <Link
                          href={`/dashboard/leads/${followup.lead_id}`}
                          className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                        >
                          View Lead <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      
      <CreateFollowupModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
      />
    </div>
  );
}
