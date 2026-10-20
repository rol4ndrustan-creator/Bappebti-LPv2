"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AUDIT_LOGS } from "@/lib/mock-data";
import { Search } from "lucide-react";

function parseDate(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function AuditLogsPage() {
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const actors = useMemo(() => Array.from(new Set(AUDIT_LOGS.map((l) => l.actor))).sort(), []);

  const filtered = useMemo(() => {
    const from = dateFrom ? parseDate(dateFrom) : null;
    const to = dateTo ? parseDate(`${dateTo}T23:59:59`) : null;
    const q = query.toLowerCase();
    return AUDIT_LOGS.filter((log) => {
      const matchesQuery =
        !q ||
        log.actor.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.object.toLowerCase().includes(q);
      const matchesActor = !actor || log.actor === actor;
      const logDate = parseDate(log.timestamp);
      const matchesFrom = !from || (!!logDate && logDate >= from);
      const matchesTo = !to || (!!logDate && logDate <= to);
      return matchesQuery && matchesActor && matchesFrom && matchesTo;
    });
  }, [query, actor, dateFrom, dateTo]);

  function resetFilters() {
    setQuery("");
    setActor("");
    setDateFrom("");
    setDateTo("");
  }

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Riwayat seluruh aktivitas dan perubahan status pada sistem untuk keperluan jejak audit."
      />

      <div className="mb-3 flex flex-wrap items-end gap-2">
        <div className="w-full max-w-xs">
          <Label>Cari</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted" />
            <Input
              placeholder="Actor, action, atau object..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="w-52">
          <Label>Nama (Actor)</Label>
          <Select value={actor} onChange={(e) => setActor(e.target.value)}>
            <option value="">Semua actor</option>
            {actors.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Label>Tanggal Dari</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="w-40">
          <Label>Tanggal Hingga</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <Button variant="secondary" size="sm" onClick={resetFilters}>
          Reset Filter
        </Button>
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
