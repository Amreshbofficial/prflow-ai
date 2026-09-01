"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, User, Globe, Mail, Briefcase } from "lucide-react";
import { leadsApi } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/page-header";

export default function NewLeadPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: leadsApi.createLead,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({
        type: "success",
        title: "Lead Created",
        description: `${data.company_name} has been added to your leads.`,
      });
      router.push(`/dashboard/leads/${data.id}`);
    },
    onError: (err: any) => {
      setIsSubmitting(false);
      toast({
        type: "error",
        title: "Failed to create lead",
        description: err.message || "Something went wrong. Please try again.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    if (!data.company_name || !data.contact_name) {
      toast({
        type: "error",
        title: "Missing fields",
        description: "Company Name and Contact Name are required.",
      });
      setIsSubmitting(false);
      return;
    }
    
    mutation.mutate(data);
  };

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
        title="Add New Lead" 
        description="Enter the prospect and company details below to start your outreach process."
      />

      <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] overflow-hidden">
        <form onSubmit={handleSubmit} className="divide-y divide-border">
          
          <div className="p-6 md:p-8 space-y-8">
            {/* Company Info Section */}
            <div>
              <h3 className="text-base font-semibold leading-6 text-text-primary flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-text-muted" />
                Company Information
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-text-primary">
                    Company Name <span className="text-error">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="company_name"
                      id="company_name"
                      placeholder="e.g. Acme Corp"
                      className="block w-full rounded-xl border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 sm:text-sm outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-text-primary">
                    Website
                  </label>
                  <div className="mt-2 relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Globe className="h-4 w-4 text-text-muted" />
                    </div>
                    <input
                      type="text"
                      name="website"
                      id="website"
                      placeholder="www.example.com"
                      className="block w-full rounded-xl border border-border bg-surface pl-10 px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 sm:text-sm outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-text-primary">
                    Industry
                  </label>
                  <div className="mt-2 relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Briefcase className="h-4 w-4 text-text-muted" />
                    </div>
                    <input
                      type="text"
                      name="industry"
                      id="industry"
                      placeholder="e.g. Technology, Healthcare"
                      className="block w-full rounded-xl border border-border bg-surface pl-10 px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 sm:text-sm outline-none transition"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-text-primary">
                    Company Description
                  </label>
                  <div className="mt-2">
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      placeholder="Brief overview of what the company does..."
                      className="block w-full rounded-xl border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 sm:text-sm resize-none outline-none transition"
                    />
                  </div>
                  <p className="mt-2 text-xs text-text-muted">
                    This helps our AI generate better, more personalized outreach.
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-border w-full" />

            {/* Contact Info Section */}
            <div>
              <h3 className="text-base font-semibold leading-6 text-text-primary flex items-center">
                <User className="h-5 w-5 mr-2 text-text-muted" />
                Contact Person
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact_name" className="block text-sm font-medium text-text-primary">
                    Full Name <span className="text-error">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="contact_name"
                      id="contact_name"
                      placeholder="e.g. Jane Doe"
                      className="block w-full rounded-xl border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 sm:text-sm outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="job_title" className="block text-sm font-medium text-text-primary">
                    Job Title
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="job_title"
                      id="job_title"
                      placeholder="e.g. CEO, Marketing Director"
                      className="block w-full rounded-xl border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 sm:text-sm outline-none transition"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="contact_email" className="block text-sm font-medium text-text-primary">
                    Email Address
                  </label>
                  <div className="mt-2 relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-text-muted" />
                    </div>
                    <input
                      type="email"
                      name="contact_email"
                      id="contact_email"
                      placeholder="jane@example.com"
                      className="block w-full rounded-xl border border-border bg-surface pl-10 px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 sm:text-sm outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-secondary/50 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
            <Link
              href="/dashboard/leads"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:from-[#4338ca] hover:to-[#4f46e5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4f46e5]/20 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Lead"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
