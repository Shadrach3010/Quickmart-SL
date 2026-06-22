"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminTableToolbar({
  query, onQueryChange, placeholder, children,
}: { query: string; onQueryChange: (value: string) => void; placeholder: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b p-4 md:flex-row">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
        <Input className="h-10 bg-white pl-9" onChange={(event) => onQueryChange(event.target.value)} placeholder={placeholder} value={query} />
      </div>
      {children}
    </div>
  );
}

export function AdminPagination({
  page, pageSize, total, onPage,
}: { page: number; pageSize: number; total: number; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>Showing {total ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} of {total}</span>
      <div className="flex items-center gap-2">
        <Button disabled={page <= 1} onClick={() => onPage(page - 1)} size="sm" variant="outline"><ChevronLeft /> Previous</Button>
        <span className="px-2 font-semibold text-foreground">{page} / {pages}</span>
        <Button disabled={page >= pages} onClick={() => onPage(page + 1)} size="sm" variant="outline">Next <ChevronRight /></Button>
      </div>
    </div>
  );
}
