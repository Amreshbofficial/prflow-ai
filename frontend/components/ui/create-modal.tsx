"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { followupsApi, leadsApi } from "@/lib/api";
import { Calendar as CalendarIcon, AlignLeft, User } from "lucide-react";
import { useToast } from "./toast";

interface CreateFollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLeadId?: string;
}

export function CreateFollowupModal({ isOpen, onClose, defaultLeadId }: CreateFollowupModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [leadId, setLeadId] = useState<string>(defaultLeadId || "");
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState<string>("");

  const { data: leadsData, isLoading: isLoadingLeads } = useQuery({
    queryKey: ["leads"],
    queryFn: leadsApi.getLeads,
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: followupsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      toast({
        type: "success",
        title: "Task Scheduled",
        description: "Your follow-up has been successfully scheduled.",
      });
      resetAndClose();
    },
    onError: () => {
      toast({
        type: "error",
        title: "Failed to schedule",
        description: "There was an error creating your follow-up.",
      });
    }
  });

  const resetAndClose = () => {
    setLeadId(defaultLeadId || "");
    setNote("");
    setDueDate("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !dueDate) return;

    createMutation.mutate({
      lead_id: Number(leadId),
      note,
      due_at: new Date(dueDate).toISOString(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Schedule Follow-up"
      description="Create a new task or reminder for a specific lead."
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={resetAndClose}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
            disabled={createMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!leadId || !dueDate || createMutation.isPending}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary-hover h-9 px-4 shadow-sm"
          >
            {createMutation.isPending ? 'Saving...' : 'Schedule Task'}
          </button>
        </>
      }
    >
      <form id="create-followup-form" onSubmit={handleSubmit} className="space-y-5 py-2">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5 flex items-center">
            <User className="h-4 w-4 mr-1.5 text-text-muted" /> Related Lead <span className="text-error ml-1">*</span>
          </label>
          {isLoadingLeads ? (
            <div className="h-10 w-full bg-surface-secondary animate-pulse rounded-md border border-border"></div>
          ) : (
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border-border bg-surface focus:outline-none focus:ring-primary focus:border-primary rounded-md transition-colors text-text-primary shadow-sm"
              required
            >
              <option value="" disabled>Select a lead...</option>
              {leadsData?.items?.map((lead: any) => (
                <option key={lead.id} value={lead.id}>
                  {lead.company_name} - {lead.contact_name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5 flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1.5 text-text-muted" /> Due Date <span className="text-error ml-1">*</span>
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="block w-full pl-3 pr-3 py-2 text-sm border-border bg-surface focus:outline-none focus:ring-primary focus:border-primary rounded-md transition-colors text-text-primary shadow-sm"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5 flex items-center">
            <AlignLeft className="h-4 w-4 mr-1.5 text-text-muted" /> Notes
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add specific details about this follow-up..."
            rows={4}
            className="block w-full rounded-md border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-primary sm:text-sm resize-none shadow-sm"
          />
        </div>
      </form>
    </Modal>
  );
}
