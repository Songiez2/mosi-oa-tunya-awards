import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getContactMessages, markMessageRead } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Loader2, MailOpen, Mail } from 'lucide-react';
import { toast } from 'sonner';
import type { ContactMessage } from '@/types/types';

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState<ContactMessage | null>(null);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const r = await getContactMessages(page, PAGE_SIZE);
    setMessages(r.data); setTotal(r.total); setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleView = async (msg: ContactMessage) => {
    setViewTarget(msg);
    if (!msg.is_read) {
      await markMessageRead(msg.id);
      load();
    }
  };

  const unread = messages.filter(m => !m.is_read).length;
  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-black text-gradient-gold">Messages</h1>
          <p className="text-xs text-muted-foreground">{total} total · {unread} unread</p>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                  {['Status', 'Name', 'Email', 'Phone', 'Message Preview', 'Date', 'Actions'].map(h => <th key={h} className="px-4 py-3 whitespace-nowrap font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : messages.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No messages yet</td></tr>
                ) : messages.map(m => (
                  <tr key={m.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${!m.is_read ? 'bg-primary/5' : ''}`}>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {m.is_read
                        ? <MailOpen className="w-4 h-4 text-muted-foreground" />
                        : <Mail className="w-4 h-4 text-primary" />}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap font-medium text-sm">{m.name}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{m.email}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{m.phone ?? '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[200px] truncate">{m.message}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary" onClick={() => handleView(m)}>
                        Read
                      </Button>
                    </td>
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

      <Dialog open={!!viewTarget} onOpenChange={() => setViewTarget(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>Message from {viewTarget?.name}</DialogTitle></DialogHeader>
          {viewTarget && (
            <div className="space-y-3 text-sm">
              {[['Email', viewTarget.email], ['Phone', viewTarget.phone ?? '—'], ['Date', new Date(viewTarget.created_at).toLocaleString()]].map(([k, v]) => (
                <div key={k} className="flex gap-2"><span className="text-muted-foreground w-12 shrink-0">{k}:</span><span>{v}</span></div>
              ))}
              <div className="mt-2 p-3 rounded-lg bg-muted border border-border text-sm leading-relaxed whitespace-pre-wrap">{viewTarget.message}</div>
              <div className="flex justify-end gap-2">
                <a href={`mailto:${viewTarget.email}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-gold text-primary-foreground text-xs font-bold">
                  <Mail className="w-3.5 h-3.5" /> Reply via Email
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
