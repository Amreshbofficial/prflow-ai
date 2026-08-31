"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Building2, User, Globe, Mail, Sparkles, BrainCircuit } from "lucide-react";
import { leadsApi, researchApi } from "@/lib/api";
import { useParams } from "next/navigation";

export default function LeadDetailsPage() {
  const params = useParams();
  const leadId = params.id as string;

  const { data: lead, isLoading, error, refetch } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => leadsApi.getLead(leadId),
  });

  const [researchData, setResearchData] = useState<any>(null);

  const researchMutation = useMutation({
    mutationFn: () => researchApi.generate(leadId),
    onSuccess: (data) => {
      setResearchData(data);
      refetch(); // Refetch lead to update status if it changed
    },
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading lead details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading lead</div>;
  if (!lead) return <div className="p-8 text-center text-gray-500">Lead not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/leads" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Link>
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/outreach/generate?leadId=${lead.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Outreach
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{lead.company_name}</h2>
            <div className="space-y-4">
              <div className="flex items-start text-sm text-gray-700">
                <Globe className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                <span className="truncate">{lead.website || "No website"}</span>
              </div>
              <div className="flex items-start text-sm text-gray-700">
                <Building2 className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                <span>{lead.industry || "Industry not specified"}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Contact Person</h3>
              <div className="space-y-4">
                <div className="flex items-start text-sm text-gray-700">
                  <User className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{lead.contact_name}</p>
                    <p className="text-gray-500">{lead.job_title}</p>
                  </div>
                </div>
                <div className="flex items-start text-sm text-gray-700">
                  <Mail className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="truncate">{lead.contact_email || "No email"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Activity & AI */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <BrainCircuit className="mr-2 h-5 w-5 text-indigo-500" />
                AI Research Summary
              </h3>
              {!researchData && (
                <button
                  onClick={() => researchMutation.mutate()}
                  disabled={researchMutation.isPending}
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-900 disabled:text-gray-400"
                >
                  {researchMutation.isPending ? "Analyzing..." : "Run AI Research"}
                </button>
              )}
            </div>
            
            <div className="p-6">
              {researchMutation.isPending ? (
                <div className="text-center py-8">
                  <Sparkles className="mx-auto h-8 w-8 text-indigo-400 animate-pulse mb-3" />
                  <p className="text-sm text-gray-500">AI is analyzing company data...</p>
                </div>
              ) : researchData ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Company Summary</h4>
                    <p className="text-sm text-gray-700">{researchData.company_summary}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Relevant PR Angles</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {researchData.relevant_pr_angles.map((angle: string, i: number) => (
                        <li key={i}>{angle}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Personalization Opportunities</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {researchData.personalization_opportunities.map((opp: string, i: number) => (
                        <li key={i}>{opp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Run AI Research to automatically generate insights and PR angles for this prospect.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
