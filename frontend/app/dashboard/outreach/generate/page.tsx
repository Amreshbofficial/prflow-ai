"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Send, Save, CheckCircle2, Bot, Wand2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { leadsApi, outreachApi, fetchAPI } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/page-header";

function GenerateOutreachContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [draft, setDraft] = useState<any>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedMessage, setEditedMessage] = useState("");

  const { data: lead, isLoading: isLeadLoading } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => leadsApi.getLead(leadId!),
    enabled: !!leadId,
  });

  const generateMutation = useMutation({
    mutationFn: outreachApi.generate,
    onSuccess: (data) => {
      setDraft(data);
      setEditedSubject(data.subject);
      setEditedMessage(data.message);
      toast({
        type: "success",
        title: "Draft Generated",
        description: "AI has successfully generated your outreach draft.",
      });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Generation Failed",
        description: "Failed to generate outreach. Please try again.",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; updates: any }) => fetchAPI(`/outreach/${data.id}`, { method: "PATCH", body: JSON.stringify(data.updates) }),
    onSuccess: (_, variables) => {
      toast({
        type: "success",
        title: "Success",
        description: `Message has been ${variables.updates.status === 'Sent' ? 'marked as sent' : 'saved'}.`,
      });
    }
  });

  const handleGenerate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    generateMutation.mutate({
      lead_id: Number(leadId),
      ...data,
    });
  };

  const handleSave = () => {
    if (draft) {
      updateMutation.mutate({
        id: draft.id,
        updates: { subject: editedSubject, message: editedMessage, status: "Draft" },
      });
    }
  };

  const sendMutation = useMutation({
    mutationFn: outreachApi.send,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-messages"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({
        type: "success",
        title: "Email Sent",
        description: "The outreach email has been sent successfully.",
      });
      router.push(`/dashboard/leads/${leadId}`);
    },
    onError: (err: Error) => {
      toast({
        type: "error",
        title: "Send Failed",
        description: err.message || "Failed to send email. Please try again.",
      });
    },
  });

  const handleSend = () => {
    if (draft) {
      // First save edits, then send
      updateMutation.mutate(
        { id: draft.id, updates: { subject: editedSubject, message: editedMessage, human_edited: true } },
        {
          onSuccess: () => {
            sendMutation.mutate(draft.id);
          },
        }
      );
    }
  };

  if (!leadId) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center bg-surface border border-border rounded-xl mt-8">
        <h3 className="text-lg font-medium text-text-primary">No lead selected</h3>
        <p className="mt-1 text-text-secondary text-sm">Please select a lead to generate outreach for.</p>
        <Link href="/dashboard/leads" className="mt-4 inline-flex items-center text-primary hover:text-primary-hover">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="mb-2">
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
      </div>

      <PageHeader 
        title="AI Outreach Generation" 
        description="Configure parameters to automatically generate personalized outreach drafts based on company data."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column - Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] overflow-hidden transition-shadow hover:shadow-[0_16px_44px_-14px_rgba(15,23,42,0.14)]">
            <div className="px-6 py-5 border-b border-border bg-surface-secondary/30">
              <h3 className="font-semibold text-text-primary flex items-center">
                <Bot className="mr-2 h-5 w-5 text-primary" />
                AI Parameters
              </h3>
            </div>

            <form onSubmit={handleGenerate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Target Lead</label>
                <div className="p-3 bg-surface-secondary/50 rounded-md text-sm border border-border flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold mr-3">
                    {isLeadLoading ? '...' : lead?.contact_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{isLeadLoading ? "Loading..." : lead?.contact_name}</p>
                    <p className="text-xs text-text-secondary">{lead?.company_name}</p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="channel" className="block text-sm font-medium text-text-primary mb-1.5">Channel</label>
                <select
                  name="channel"
                  id="channel"
                  className="block w-full pl-3 pr-10 py-2 text-sm border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] rounded-xl transition-colors text-text-primary shadow-sm"
                >
                  <option value="Email">Email</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Twitter">Twitter (DM)</option>
                </select>
              </div>

              <div>
                <label htmlFor="goal" className="block text-sm font-medium text-text-primary mb-1.5">Primary Goal</label>
                <select
                  name="goal"
                  id="goal"
                  className="block w-full pl-3 pr-10 py-2 text-sm border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] rounded-xl transition-colors text-text-primary shadow-sm"
                >
                  <option value="Introductory Call">Introductory Call</option>
                  <option value="Product Demo">Product Demo</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Content Collaboration">Content Collaboration</option>
                  <option value="Event Invitation">Event Invitation</option>
                </select>
              </div>

              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-text-primary mb-1.5">Tone of Voice</label>
                <select
                  name="tone"
                  id="tone"
                  className="block w-full pl-3 pr-10 py-2 text-sm border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] rounded-xl transition-colors text-text-primary shadow-sm"
                >
                  <option value="Professional & Direct">Professional & Direct</option>
                  <option value="Friendly & Casual">Friendly & Casual</option>
                  <option value="Enthusiastic">Enthusiastic</option>
                  <option value="Consultative">Consultative (Expert)</option>
                </select>
              </div>

              <div>
                <label htmlFor="key_angle" className="block text-sm font-medium text-text-primary mb-1.5">Key Angle / Context (Optional)</label>
                <textarea
                  name="key_angle"
                  id="key_angle"
                  rows={3}
                  className="block w-full rounded-xl border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 sm:text-sm resize-none shadow-sm outline-none transition"
                  placeholder="E.g., I saw their recent product launch and want to propose a joint webinar..."
                ></textarea>
                <p className="mt-1.5 text-xs text-text-muted">
                  Add specific context to guide the AI's generation.
                </p>
              </div>

              <div className="pt-2 border-t border-border mt-6">
                <button
                  type="submit"
                  disabled={generateMutation.isPending || isLeadLoading}
                  className="group w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:from-[#4338ca] hover:to-[#4f46e5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate Draft
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Editor */}
        <div className="lg:col-span-8 space-y-6 h-full min-h-[600px]">
          <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] h-full flex flex-col overflow-hidden transition-shadow hover:shadow-[0_16px_44px_-14px_rgba(15,23,42,0.14)]">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface-secondary/30">
              <h3 className="font-semibold text-text-primary">Review & Edit</h3>
              {draft && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-soft text-primary border border-primary/20">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> AI Generated
                </span>
              )}
            </div>

            <div className="flex-1 flex flex-col p-0">
              {!draft ? (
                <div className="flex-1 flex items-center justify-center flex-col text-center p-12">
                  <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mb-4 border border-border">
                    <Sparkles className="h-8 w-8 text-text-muted" />
                  </div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">No Draft Generated</h3>
                  <p className="text-sm text-text-secondary max-w-sm">
                    Configure your parameters on the left and click "Generate Draft" to create a personalized outreach message.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col h-full">
                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">Subject Line</label>
                      <input
                        type="text"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        className="block w-full rounded-xl border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 sm:text-sm shadow-sm font-medium outline-none transition"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="block text-sm font-medium text-text-primary mb-1.5">Message Body</label>
                      <textarea
                        value={editedMessage}
                        onChange={(e) => setEditedMessage(e.target.value)}
                        className="flex-1 block w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 sm:text-sm shadow-sm resize-none font-sans leading-relaxed min-h-[300px] outline-none transition"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="bg-surface-secondary/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-border mt-auto">
                    <button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20 shadow-sm disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      Save Draft
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={updateMutation.isPending || sendMutation.isPending}
                      className="group inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:from-[#4338ca] hover:to-[#4f46e5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {(updateMutation.isPending || sendMutation.isPending) ? "Sending..." : "Send Email"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GenerateOutreachPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><p className="text-text-muted text-sm">Loading...</p></div>}>
      <GenerateOutreachContent />
    </Suspense>
  );
}
