"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Calendar } from "lucide-react";
import { followupsApi } from "@/lib/api";

export default function FollowupsPage() {
  const queryClient = useQueryClient();

  const { data: followups, isLoading, error } = useQuery({
    queryKey: ["followups"],
    queryFn: followupsApi.getFollowups,
  });

  const completeMutation = useMutation({
    mutationFn: followupsApi.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Follow-ups</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your scheduled follow-ups and tasks.
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Pending Tasks</h3>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 text-sm">Loading follow-ups...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500 text-sm">Error loading follow-ups.</div>
          ) : followups?.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No follow-ups</h3>
              <p className="mt-1 text-sm text-gray-500">You have no scheduled follow-ups right now.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {followups?.map((followup: any) => (
                <li key={followup.id} className="py-4 flex justify-between items-center">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <div className={`h-3 w-3 rounded-full ${followup.status === 'Completed' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Lead ID: {followup.lead_id}</p>
                      <p className="text-sm text-gray-500">{followup.note || "No specific note"}</p>
                      <p className="text-xs text-gray-400 mt-1">Due: {new Date(followup.due_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    {followup.status !== 'Completed' && (
                      <button
                        onClick={() => completeMutation.mutate(followup.id)}
                        disabled={completeMutation.isPending}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Check className="h-3 w-3 mr-1" /> Mark Done
                      </button>
                    )}
                    {followup.status === 'Completed' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
