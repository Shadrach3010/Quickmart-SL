"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AdminPagination, AdminTableToolbar } from "@/components/admin/table-tools";

export interface AdminColumn<T> {
  label: string;
  className?: string;
  render: (item: T) => ReactNode;
}

export function AdminDataGrid<T extends { id: string }>({
  rows, columns, search, searchPlaceholder, filter, filterOptions = [],
  pageSize = 8, selectable = false, bulkActions, rowAction, emptyMessage = "No records found.",
}: {
  rows: T[];
  columns: AdminColumn<T>[];
  search: (item: T) => string;
  searchPlaceholder: string;
  filter?: (item: T) => string;
  filterOptions?: Array<{ label: string; value: string }>;
  pageSize?: number;
  selectable?: boolean;
  bulkActions?: (selected: T[], clear: () => void) => ReactNode;
  rowAction?: (item: T) => ReactNode;
  emptyMessage?: string;
}) {
  const [query, setQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const filtered = useMemo(() => rows.filter((item) => {
    const matchesQuery = search(item).toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filterValue === "all" || filter?.(item) === filterValue;
    return matchesQuery && matchesFilter;
  }), [rows, search, query, filter, filterValue]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const selected = rows.filter((item) => selectedIds.has(item.id));
  const visibleSelected = visible.length > 0 && visible.every((item) => selectedIds.has(item.id));

  function toggle(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleVisible() {
    setSelectedIds((current) => {
      const next = new Set(current);
      visible.forEach((item) => visibleSelected ? next.delete(item.id) : next.add(item.id));
      return next;
    });
  }

  return (
    <Card className="gap-0 border-0 py-0 shadow-sm">
      <AdminTableToolbar
        onQueryChange={(value) => { setQuery(value); setPage(1); }}
        placeholder={searchPlaceholder}
        query={query}
      >
        {filterOptions.length > 0 && (
          <select
            aria-label="Filter records"
            className="h-10 rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => { setFilterValue(event.target.value); setPage(1); }}
            value={filterValue}
          >
            <option value="all">All records</option>
            {filterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        )}
      </AdminTableToolbar>
      {selected.length > 0 && bulkActions && (
        <div className="flex flex-wrap items-center gap-3 border-b bg-slate-900 px-4 py-2.5 text-sm text-white">
          <span className="font-semibold">{selected.length} selected</span>
          <div className="ml-auto flex gap-2">{bulkActions(selected, () => setSelectedIds(new Set()))}</div>
        </div>
      )}
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow>
            {selectable && <TableHead className="w-10 pl-4"><input aria-label="Select visible records" checked={visibleSelected} onChange={toggleVisible} type="checkbox" /></TableHead>}
            {columns.map((column) => <TableHead className={column.className} key={column.label}>{column.label}</TableHead>)}
            {rowAction && <TableHead className="w-20 text-right">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length ? visible.map((item) => (
            <TableRow data-state={selectedIds.has(item.id) ? "selected" : undefined} key={item.id}>
              {selectable && <TableCell className="pl-4"><input aria-label={`Select ${search(item)}`} checked={selectedIds.has(item.id)} onChange={() => toggle(item.id)} type="checkbox" /></TableCell>}
              {columns.map((column) => <TableCell className={column.className} key={column.label}>{column.render(item)}</TableCell>)}
              {rowAction && <TableCell className="text-right">{rowAction(item)}</TableCell>}
            </TableRow>
          )) : (
            <TableRow><TableCell className="h-32 text-center text-muted-foreground" colSpan={columns.length + (selectable ? 1 : 0) + (rowAction ? 1 : 0)}>{emptyMessage}</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
      <AdminPagination onPage={setPage} page={safePage} pageSize={pageSize} total={filtered.length} />
    </Card>
  );
}

export function AdminBulkButton({
  children, onClick, disabled,
}: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return <Button className="border-white/20 bg-white/10 text-white hover:bg-white/20" disabled={disabled} onClick={onClick} size="sm" variant="outline">{children}</Button>;
}
