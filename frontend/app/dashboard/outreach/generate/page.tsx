"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Send, Save, CheckCircle } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { leadsApi, outreachApi, fetchAPI } from "@/lib/api";

export default function GenerateOutreachPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId");

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
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; updates: any }) => fetchAPI(`/outreach/${data.id}`, { method: "PATCH", body: JSON.stringify(data.updates) }),
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

  const handleSend = () => {
    if (draft) {
      updateMutation.mutate({
        id: draft.id,
        updates: { subject: editedSubject, message: editedMessage, status: "Sent" },
      }, {
        onSuccess: () => {
          router.push(`/dashboard/leads/${leadId}`);
        }
      });
    }
  };

  if (!leadId) return <div className="p-8">No lead selected. Go back and select a lead.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Link href={`/dashboard/leads/${leadId}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lead Details
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column - Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">AI Outreach Generation</h2>
              <p className="mt-1 text-sm text-gray-500">
                Configure the AI parameters to draft your message.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Recipient</label>
                <div className="mt-1 p-2 bg-gray-50 rounded-md text-sm border border-gray-200">
                  {isLeadLoading ? "Loading..." : `${lead?.contact_name} at ${lead?.company_name}`}
                </div>
              </div>

              <div>
                <label htmlFor="channel" className="block text-sm font-medium text-gray-700">Channel</label>
                <select name="channel" id="channel" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border">
                  <option value="Email">Email</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Twitter">Twitter</option>
                </select>
              </div>

              <div>
                <label htmlFor="goal" className="block text-sm font-medium text-gray-700">Primary Goal</label>
                <select name="goal" id="goal" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border">
                  <option value="Introductory Call">Introductory Call</option>
                  <option value="Product Demo">Product Demo</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Content Collaboration">Content Collaboration</option>
                </select>
              </div>

              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-700">Tone</label>
                <select name="tone" id="tone" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border">
                  <option value="Professional & Direct">Professional & Direct</option>
                  <option value="Friendly & Casual">Friendly & Casual</option>
                  <option value="Enthusiastic">Enthusiastic</option>
                </select>
              </div>

              <div>
                <label htmlFor="key_angle" className="block text-sm font-medium text-gray-700">Key Angle / Context</label>
                <textarea
                  name="key_angle"
                  id="key_angle"
                  rows={3}
                  className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                  placeholder="E.g., I saw their recent product launch and want to propose..."
                ></textarea>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={generateMutation.isPending}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {generateMutation.isPending ? "Generating..." : "Generate Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Editor */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 h-full flex flex-col">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Review & Edit</h2>
              {draft && (
                <div className="flex space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" /> AI Generated
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col">
              {!draft ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
                  <Sparkles className="h-12 w-12 mb-4 opacity-50" />
                  <p>Configure parameters and click Generate to create a draft.</p>
                </div>
              ) : (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                    <textarea
                      value={editedMessage}
                      onChange={(e) => setEditedMessage(e.target.value)}
                      className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3 min-h-[300px]"
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200 mt-4">
                    <button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={updateMutation.isPending}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {updateMutation.isPending ? "Sending..." : "Mark as Sent"}
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
