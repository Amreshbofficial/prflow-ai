"use client";

import { HelpCircle, Mail, MessageSquare, BookOpen, ExternalLink, ChevronRight, Copy, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function HelpPage() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const supportEmail = "support@prflow.ai";

  const copyEmail = () => {
    navigator.clipboard.writeText(supportEmail).then(() => {
      setCopied(true);
      toast({
        type: "success",
        title: "Email Copied",
        description: "Support email address copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Hero header band */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#4f46e5]/[0.06] via-surface to-surface p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.14),transparent_70%)]" />
        <div className="relative">
          <PageHeader
            title="Help & Support"
            description="Everything you need to get the most out of PRFlow AI. Browse resources or contact our team."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Documentation Card - Info Only */}
        <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] p-6 transition-shadow duration-300">
          <div className="h-12 w-12 bg-gradient-to-br from-[#4f46e5]/[0.12] to-[#6366f1]/[0.06] text-primary rounded-xl flex items-center justify-center mb-5 border border-[#4f46e5]/10">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">Documentation</h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            Comprehensive guides on setting up AI providers, managing your CRM, and customizing outreach campaigns.
          </p>
          <div className="bg-surface-secondary/50 rounded-xl p-4 border border-border">
            <p className="text-sm text-text-muted">
              Documentation is coming soon. In the meantime, refer to the API documentation available at the{" "}
              <code className="px-1.5 py-0.5 bg-surface rounded text-xs font-mono text-primary border border-border">/api/docs</code>{" "}
              endpoint for backend API details.
            </p>
          </div>
        </div>

        {/* Support Contact Card */}
        <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] p-6 transition-shadow duration-300">
          <div className="h-12 w-12 bg-success-soft text-success rounded-xl flex items-center justify-center mb-5 border border-success/20">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">Contact Support</h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            Our support team is available to help with any technical issues, account questions, or feature requests.
          </p>
          <button
            onClick={copyEmail}
            className="group inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors shadow-sm w-full justify-center"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-success" />
                <span>{supportEmail} (copied!)</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>{supportEmail}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] overflow-hidden transition-shadow hover:shadow-[0_16px_44px_-14px_rgba(15,23,42,0.14)]">
        <div className="px-6 py-5 border-b border-border bg-surface-secondary/30">
          <h3 className="text-lg font-semibold text-text-primary">Quick Links</h3>
        </div>
        <div className="divide-y divide-border">
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-6 py-4 hover:bg-surface-secondary/30 transition-colors"
          >
            <div>
              <h4 className="text-sm font-semibold text-text-primary">API Documentation</h4>
              <p className="text-xs text-text-muted mt-0.5">Interactive Swagger/OpenAPI documentation</p>
            </div>
            <ExternalLink className="h-4 w-4 text-text-muted" />
          </a>
          <div className="px-6 py-4">
            <h4 className="text-sm font-semibold text-text-primary">Frequently Asked Questions</h4>
            <div className="mt-3 space-y-3">
              <FAQItem
                question="How do I set up an AI provider?"
                answer="Go to Settings → AI Preferences to set your default tone and channel. For actual AI generation, configure your OpenAI or Anthropic API key as an environment variable on the backend."
              />
              <FAQItem
                question="Why are my outreach emails not sending?"
                answer="Email sending requires a valid RESEND_API_KEY configured on the backend. Without it, the system runs in demo mode. Contact support for assistance with setup."
              />
              <FAQItem
                question="How do I import leads from a CSV?"
                answer="Navigate to the Leads page and click the Import button. Upload a CSV file with columns for Company Name, Contact Name, Email, Website, Industry, and Job Title."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-text-primary hover:bg-surface-secondary/50 transition-colors"
      >
        {question}
        <ChevronRight className={cn("h-4 w-4 text-text-muted transition-transform", isOpen && "rotate-90")} />
      </button>
      {isOpen && (
        <div className="px-4 pb-3 text-sm text-text-secondary bg-surface-secondary/20">
          {answer}
        </div>
      )}
    </div>
  );
}
