import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getAuditLogs } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Search, Loader2, ShieldCheck } from 'lucide-react';
import type { AuditLog } from '@/types/types';

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-success/10 text-success border-success/30',
  update: 'bg-primary/10 text-primary border-primary/30',
  delete: 'bg-destructive/10 text-destructive border-destructive/30',
  approve: 'bg-success/10 text-success border-success/30',
  reject: 'bg-warning/10 text-warning border-warning/30',
  login: 'bg-muted text-muted-foreground',
  logout: 'bg-muted text-muted-foreground',
};

export default function AdminAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const PAGE_SIZE = 25;

  const load = useCallback(async () => {
    setLoading(true);
    const r = await getAuditLogs(page, PAGE_SIZE);
    setLogs(r.data); setTotal(r.total); setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const filtered = search
    ? logs.filter(l => l.action.toLowerCase().includes(search.toLowerCase()) || (l.entity_type?.toLowerCase().includes(search.toLowerCase()) ?? false) || (l.user_id?.toLowerCase().includes(search.toLowerCase()) ?? false))
    : logs;

  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-black text-gradient-gold">Audit Logs</h1>
            <p className="text-xs text-muted-foreground">{total} total log entries</p>
          </div>
          <div className="flex items-center gap-2 bg-muted border border-border rounded-lg px-3 h-9 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input className="bg-transparent text-sm outline-none flex-1 min-w-0" placeholder="Filter action, entity, user..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                  {['Timestamp', 'User', 'Action', 'Entity', 'Entity ID', 'Details', 'IP'].map(h => <th key={h} className="px-4 py-3 whitespace-nowrap font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    No audit logs found
                  </td></tr>
                ) : filtered.map(log => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs font-mono text-muted-foreground">{log.user_id ? log.user_id.slice(0, 8) + '…' : '—'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Badge variant="outline" className={`text-[10px] font-semibold ${ACTION_COLORS[log.action] ?? 'bg-muted text-muted-foreground'}`}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{log.entity_type ?? '—'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs font-mono text-muted-foreground">{log.entity_id ? log.entity_id.slice(0, 8) + '…' : '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[200px] truncate">
                      {log.details ? (typeof log.details === 'object' ? JSON.stringify(log.details).slice(0, 80) : String(log.details).slice(0, 80)) : '—'}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground font-mono">{log.ip_address ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-xs text-muted-foreground">Page {page} of {pages}</span>
            <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
