"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AUDIT_LOGS } from "@/lib/mock-data";
import { Search } from "lucide-react";

export default function AuditLogsPage() {
  const [query, setQuery] = useState("");

  const filtered = AUDIT_LOGS.filter((log) => {
    const q = query.toLowerCase();
    return (
      log.actor.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.object.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Riwayat seluruh aktivitas dan perubahan status pada sistem untuk keperluan jejak audit."
      />

      <div className="mb-3 relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted" />
        <Input
          placeholder="Cari berdasarkan actor, action, atau object..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Ticket / Object</TableHead>
            <TableHead>Before</TableHead>
            <TableHead>After</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted py-4">
                Tidak ada hasil yang cocok.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((log, i) => (
              <TableRow key={i}>
                <TableCell className="whitespace-nowrap">{log.timestamp}</TableCell>
                <TableCell className="font-medium">{log.actor}</TableCell>
                <TableCell>{log.role}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell className="text-navy font-medium whitespace-nowrap">{log.object}</TableCell>
                <TableCell className="text-muted">{log.before}</TableCell>
                <TableCell className="text-muted">{log.after}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
