"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Save, CheckCircle2, Bot, PenSquare } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAPI, outreachApi } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/loading-skeleton";

export default function EditOutreachPage() {
  const router = useRouter();
  const params = useParams();
  const outreachId = params.id as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editedSubject, setEditedSubject] = useState("");
  const [editedMessage, setEditedMessage] = useState("");

  const { data: outreach, isLoading } = useQuery({
    queryKey: ["outreach", outreachId],
    queryFn: () => fetchAPI(`/outreach/${outreachId}`),
  });

  useEffect(() => {
    if (outreach) {
      setEditedSubject(outreach.subject || "");
      setEditedMessage(outreach.message || "");
    }
  }, [outreach]);

  const updateMutation = useMutation({
    mutationFn: (updates: any) => fetchAPI(`/outreach/${outreachId}`, { method: "PATCH", body: JSON.stringify(updates) }),
  });

  const handleSave = () => {
    updateMutation.mutate({
      subject: editedSubject, 
      message: editedMessage, 
      status: "Draft",
      human_edited: true
    }, {
      onSuccess: () => {
        toast({
          type: "success",
          title: "Draft Saved",
          description: "Your changes have been saved successfully.",
        });
        router.push(`/dashboard/leads/${outreach?.lead_id}`);
      },
      onError: () => {
        toast({
          type: "error",
          title: "Save Failed",
          description: "Failed to save your changes. Please try again.",
        });
      }
    });
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
      router.push(`/dashboard/leads/${outreach?.lead_id}`);
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
    // First save edits, then send
    updateMutation.mutate(
      { subject: editedSubject, message: editedMessage, human_edited: true },
      {
        onSuccess: () => {
          sendMutation.mutate(Number(outreachId));
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6 animate-in fade-in p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (!outreach) {
    return (
      <div className="w-full mt-8 text-center py-12 px-4 border border-border rounded-lg bg-error-soft/30">
        <h3 className="text-sm font-medium text-text-primary">Outreach not found</h3>
        <p className="mt-1 text-sm text-text-secondary">The requested outreach draft could not be loaded.</p>
        <button onClick={() => router.back()} className="mt-4 inline-flex items-center text-sm text-primary hover:text-primary-hover">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back
        </button>
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
        title="Edit Outreach Draft" 
        description="Review and polish the generated outreach message before sending."
      >
        <StatusBadge status={outreach.status} />
        {outreach.ai_generated && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-soft text-primary border border-primary/20 shadow-sm">
            <Bot className="h-3.5 w-3.5 mr-1" /> AI Generated
          </span>
        )}
      </PageHeader>

      <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] h-full flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface-secondary/30">
          <h3 className="font-semibold text-text-primary flex items-center">
            <PenSquare className="mr-2 h-5 w-5 text-primary" />
            Message Editor
          </h3>
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Channel: {outreach.channel || "Email"}
          </span>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-6 space-y-5 flex-1 flex flex-col">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Subject Line</label>
              <input
                type="text"
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                className="block w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 sm:text-sm shadow-sm font-medium outline-none transition"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-text-primary mb-1.5">Message Body</label>
              <textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className="flex-1 block w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 sm:text-sm shadow-sm resize-none font-sans leading-relaxed min-h-[400px] outline-none transition"
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
            </button>              <button
              onClick={handleSend}
              disabled={updateMutation.isPending || sendMutation.isPending}
              className="group inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:from-[#4338ca] hover:to-[#4f46e5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {(updateMutation.isPending || sendMutation.isPending) ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
