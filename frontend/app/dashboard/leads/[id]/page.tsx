"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Building2, User, Globe, Mail, Sparkles, BrainCircuit, MessageSquare, Activity, CheckCircle, Clock, MoreHorizontal, Briefcase, ExternalLink, PenSquare, Trash } from "lucide-react";
import { leadsApi, researchApi } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("overview");

  const { data: lead, isLoading, error, refetch } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => leadsApi.getLead(leadId),
  });

  const [researchData, setResearchData] = useState<any>(null);

  const researchMutation = useMutation({
    mutationFn: () => researchApi.generate(leadId),
    onSuccess: (data) => {
      setResearchData(data);
      refetch();
      toast({
        type: "success",
        title: "Research Complete",
        description: "AI has successfully analyzed this lead.",
      });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Research Failed",
        description: "Failed to generate AI insights.",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="w-full space-y-6 p-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-[400px] lg:col-span-1" />
          <Skeleton className="h-[400px] lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="w-full mt-8 text-center py-12 px-4 border border-border rounded-lg bg-error-soft/30">
        <h3 className="text-sm font-medium text-text-primary">Failed to load lead</h3>
        <p className="mt-1 text-sm text-text-secondary">Please try returning to the leads list.</p>
        <Link href="/dashboard/leads" className="mt-4 inline-flex items-center text-sm text-primary hover:text-primary-hover">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "research", label: "AI Research" },
    { id: "outreach", label: "Outreach History" },
    { id: "activity", label: "Activity Log" },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="mb-2">
        <button onClick={() => window.history.length > 1 ? router.back() : router.push('/dashboard/leads')} className="inline-flex items-center text-sm font-medium text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
      </div>

      <PageHeader 
        title={lead.company_name} 
        description={`Added on ${new Date(lead.created_at || Date.now()).toLocaleDateString()}`}
      >
        <StatusBadge status={lead.status} />
        
        <DropdownMenu
          trigger={
            <button className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          }
        >
          <div className="min-w-[160px]">
            <DropdownMenuItem onClick={() => router.push(`/dashboard/leads/${leadId}/edit`)}>
              <PenSquare className="mr-2 h-4 w-4" /> Edit Lead
            </DropdownMenuItem>
            <div className="h-px bg-border my-1" />
            <DropdownMenuItem 
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this lead?")) {
                  leadsApi.delete(leadId).then(() => {
                    toast({
                      type: "success",
                      title: "Lead deleted",
                      description: "The lead has been removed."
                    });
                    router.push('/dashboard/leads');
                  }).catch(() => {
                    toast({
                      type: "error",
                      title: "Delete failed",
                      description: "Failed to delete the lead."
                    });
                  });
                }
              }}
              className="text-error hover:bg-error-soft"
            >
              <Trash className="mr-2 h-4 w-4" /> Delete Lead
            </DropdownMenuItem>
          </div>
        </DropdownMenu>

        <Link
          href={`/dashboard/outreach/generate?leadId=${lead.id}`}
          className="group inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:from-[#4338ca] hover:to-[#4f46e5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20 active:scale-[0.99]"
        >
          <Sparkles className="h-4 w-4" />
          Generate Outreach
        </Link>
      </PageHeader>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary hover:border-border-strong"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] overflow-hidden transition-shadow hover:shadow-[0_16px_44px_-14px_rgba(15,23,42,0.14)]">
            <div className="p-5 border-b border-border bg-surface-secondary/30">
              <h3 className="font-semibold text-text-primary flex items-center">
                <Building2 className="mr-2 h-5 w-5 text-text-muted" />
                Company Details
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Website</span>
                <div className="mt-1 flex items-center text-sm text-text-primary">
                  <Globe className="h-4 w-4 text-text-muted mr-2 flex-shrink-0" />
                  {lead.website ? (
                    <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                      {lead.website} <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : (
                    "No website provided"
                  )}
                </div>
              </div>
              
              <div>
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Industry</span>
                <div className="mt-1 flex items-center text-sm text-text-primary">
                  <Briefcase className="h-4 w-4 text-text-muted mr-2 flex-shrink-0" />
                  {lead.industry || "Not specified"}
                </div>
              </div>

              {lead.description && (
                <div>
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Description</span>
                  <p className="mt-1 text-sm text-text-primary whitespace-pre-wrap">
                    {lead.description}
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-border bg-surface-secondary/30">
              <h3 className="font-semibold text-text-primary flex items-center">
                <User className="mr-2 h-5 w-5 text-text-muted" />
                Contact Person
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Name</span>
                <p className="mt-1 font-medium text-sm text-text-primary">{lead.contact_name}</p>
                <p className="text-sm text-text-secondary">{lead.job_title || "No job title"}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Email</span>
                <div className="mt-1 flex items-center text-sm text-text-primary">
                  <Mail className="h-4 w-4 text-text-muted mr-2 flex-shrink-0" />
                  {lead.contact_email ? (
                    <a href={`mailto:${lead.contact_email}`} className="text-primary hover:underline">
                      {lead.contact_email}
                    </a>
                  ) : (
                    "No email provided"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tab Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overview / Research Tab */}
          {(activeTab === "overview" || activeTab === "research") && (
            <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] overflow-hidden transition-shadow hover:shadow-[0_16px_44px_-14px_rgba(15,23,42,0.14)]">
              <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface-secondary/30">
                <h3 className="text-lg font-semibold text-text-primary flex items-center">
                  <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
                  AI Research Insights
                </h3>
                {!researchData && (
                  <button
                    onClick={() => researchMutation.mutate()}
                    disabled={researchMutation.isPending}
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {researchMutation.isPending ? (
                      <>
                        <Sparkles className="mr-1.5 h-4 w-4 animate-pulse" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-1.5 h-4 w-4" /> Run AI Analysis
                      </>
                    )}
                  </button>
                )}
              </div>
              
              <div className="p-6">
                {researchMutation.isPending ? (
                  <div className="text-center py-12 space-y-4">
                    <BrainCircuit className="mx-auto h-10 w-10 text-primary animate-pulse" />
                    <p className="text-sm font-medium text-text-primary">AI is analyzing company data...</p>
                    <p className="text-xs text-text-muted">Extracting PR angles and personalization points.</p>
                  </div>
                ) : researchData ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Company Summary</h4>
                      <div className="bg-surface-secondary/50 rounded-lg p-4 border border-border">
                        <p className="text-sm text-text-primary leading-relaxed">{researchData.company_summary}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Relevant PR Angles</h4>
                      <ul className="space-y-2">
                        {researchData.relevant_pr_angles.map((angle: string, i: number) => (
                          <li key={i} className="flex items-start text-sm text-text-primary bg-surface-secondary/30 rounded p-3 border border-border/50">
                            <CheckCircle className="h-4 w-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                            <span>{angle}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Personalization Opportunities</h4>
                      <ul className="space-y-2">
                        {researchData.personalization_opportunities.map((opp: string, i: number) => (
                          <li key={i} className="flex items-start text-sm text-text-primary bg-primary-soft/30 rounded p-3 border border-primary/20">
                            <Sparkles className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>{opp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-border rounded-lg bg-surface-secondary/20">
                    <BrainCircuit className="mx-auto h-10 w-10 text-text-muted mb-3" />
                    <h3 className="text-sm font-medium text-text-primary">No research data available</h3>
                    <p className="mt-1 text-sm text-text-secondary max-w-sm mx-auto mb-4">
                      Run AI Research to automatically generate insights, summaries, and PR angles for this prospect based on their company data.
                    </p>
                    <button
                      onClick={() => researchMutation.mutate()}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary-hover h-9 px-4 shadow-sm"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Run AI Analysis
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Outreach Tab */}
          {(activeTab === "overview" || activeTab === "outreach") && (
            <div className="bg-surface shadow-card rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface-secondary/30">
                <h3 className="text-lg font-semibold text-text-primary flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                  Latest Outreach
                </h3>
              </div>
              <div className="p-6">
                {lead.outreach_messages && lead.outreach_messages.length > 0 ? (
                  <div className="space-y-4">
                    <div className="border border-border rounded-lg p-5 bg-surface shadow-sm">
                      <div className="mb-4 flex justify-between items-start">
                        <div>
                          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Subject</p>
                          <h4 className="text-base font-semibold text-text-primary">
                            {lead.outreach_messages[0].subject || "No Subject"}
                          </h4>
                        </div>
                        <StatusBadge status={lead.outreach_messages[0].status} />
                      </div>
                      <div className="h-px bg-border mb-4" />
                      <div className="text-sm text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">
                        {lead.outreach_messages[0].message}
                      </div>
                    </div>
                    <div className="flex space-x-3 pt-2">
                      <Link
                        href={`/dashboard/outreach/${lead.outreach_messages[0].id}/edit`}
                        className="inline-flex items-center px-4 py-2 border border-border shadow-sm text-sm font-medium rounded-md text-text-primary bg-surface hover:bg-surface-secondary transition-colors"
                      >
                        <PenSquare className="h-4 w-4 mr-2" />
                        Edit Draft
                      </Link>
                      <Link
                        href={`/dashboard/outreach/generate?leadId=${lead.id}`}
                        className="inline-flex items-center px-4 py-2 border border-primary/20 shadow-sm text-sm font-medium rounded-md text-primary bg-primary-soft/50 hover:bg-primary-soft transition-colors"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Regenerate AI Draft
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-border rounded-lg bg-surface-secondary/20">
                    <MessageSquare className="mx-auto h-10 w-10 text-text-muted mb-3" />
                    <h3 className="text-sm font-medium text-text-primary">No outreach messages</h3>
                    <p className="mt-1 text-sm text-text-secondary mb-4">
                      You haven't generated any PR pitches for this lead yet.
                    </p>
                    <Link
                      href={`/dashboard/outreach/generate?leadId=${lead.id}`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary-hover h-9 px-4 shadow-sm"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate First Draft
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="bg-surface shadow-card rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-5 border-b border-border bg-surface-secondary/30">
                <h3 className="text-lg font-semibold text-text-primary flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-text-muted" />
                  Activity Timeline
                </h3>
              </div>
              <div className="p-6">
                {lead.activities && lead.activities.length > 0 ? (
                  <div className="flow-root">
                    <ul role="list" className="-mb-8">
                      {lead.activities.map((activity: any, activityIdx: number) => (
                        <li key={activity.id}>
                          <div className="relative pb-8">
                            {activityIdx !== lead.activities.length - 1 ? (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={cn(
                                  "h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-surface",
                                  activity.type === 'created' ? "bg-surface-secondary border border-border" :
                                  activity.type === 'research' ? "bg-primary-soft border border-primary/20" :
                                  "bg-success-soft border border-success/20"
                                )}>
                                  {activity.type === 'created' ? (
                                    <User className="h-4 w-4 text-text-secondary" />
                                  ) : activity.type === 'research' ? (
                                    <BrainCircuit className="h-4 w-4 text-primary" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 text-success" />
                                  )}
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                <div>
                                  <p className="text-sm font-medium text-text-primary">
                                    {activity.description}
                                  </p>
                                </div>
                                <div className="whitespace-nowrap text-right text-xs text-text-muted flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <time dateTime={activity.created_at}>
                                    {new Date(activity.created_at).toLocaleDateString()}
                                  </time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-text-muted">No activity recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
