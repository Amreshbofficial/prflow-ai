"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Modal } from "../ui/modal";
import { SearchInput } from "../ui/search-input";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const allMocks = [
    { type: "Lead", title: "FinEdge", id: 1, href: "/dashboard/leads/1" },
    { type: "Lead", title: "CloudMesh", id: 2, href: "/dashboard/leads/2" },
    { type: "Lead", title: "Vertex Robotics", id: 3, href: "/dashboard/leads/3" },
    { type: "Outreach", title: "FinEdge Introduction", id: 1, href: "/dashboard/outreach/1" },
    { type: "Outreach", title: "CloudMesh Follow-up", id: 2, href: "/dashboard/outreach/2" },
  ];

  const results = query.length > 1 
    ? allMocks.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.type.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full max-w-sm items-center gap-2 rounded-md border border-border bg-surface-secondary px-3 py-1.5 text-sm text-text-muted hover:border-border-strong hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search leads, outreach, companies...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-surface px-1.5 font-mono text-[10px] font-medium text-text-muted">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Global Search"
        maxWidth="lg"
      >
        <div className="flex flex-col space-y-4">
          <SearchInput
            placeholder="Type to search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          <div className="max-h-80 overflow-y-auto">
            {query.length === 0 ? (
              <p className="p-4 text-center text-sm text-text-muted">
                Start typing to search across PRFlow AI.
              </p>
            ) : results.length === 0 ? (
              <p className="p-4 text-center text-sm text-text-muted">
                No results found for "{query}".
              </p>
            ) : (
              <ul className="space-y-1">
                {results.map((result) => (
                  <li key={`${result.type}-${result.id}`}>
                    <button
                      onClick={() => handleSelect(result.href)}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-surface-secondary focus:bg-surface-secondary focus:outline-none transition-colors"
                    >
                      <span className="font-medium text-text-primary">{result.title}</span>
                      <span className="text-xs text-text-muted bg-surface-secondary px-2 py-0.5 rounded-full border border-border">
                        {result.type}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
