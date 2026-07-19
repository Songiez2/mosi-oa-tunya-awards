import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PublicLayout from '@/components/layouts/PublicLayout';
import { getUserPayments } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Receipt } from 'lucide-react';
import type { Payment } from '@/types/types';

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user, page]);

  const loadPayments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserPayments(user.id);
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(payments.length / PAGE_SIZE);
  const paginatedPayments = payments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!user) {
    return (
      <PublicLayout>
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Receipt className="w-16 h-16 text-primary/20 mx-auto mb-4" />
            <p className="text-muted-foreground">Please log in to view your payment history</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-gradient-gold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
              Payment History
            </h1>
            <p className="text-muted-foreground text-sm">View your voting payment history and status</p>
          </div>

          <div className="glass-card rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-20">
                <Receipt className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-muted-foreground">No payments found</h3>
                <p className="text-sm text-muted-foreground mt-1">You haven't made any voting payments yet</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                        <th className="px-4 py-3 font-semibold">Reference</th>
                        <th className="px-4 py-3 font-semibold">Type</th>
                        <th className="px-4 py-3 font-semibold">Amount</th>
                        <th className="px-4 py-3 font-semibold">Votes</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 font-semibold">Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPayments.map((payment) => (
                        <tr key={payment.id} className="border-b border-border/50 hover:bg-muted/.transition-colors">
                          <td className="px-4 py-3 text-[10px] text-muted-foreground font-mono">
                            {payment.transaction_ref.slice(0, 12)}…
                          </td>
                          <td className="px-4 py-3 text-xs capitalize">{payment.payment_type}</td>
                          <td className="px-4 py-3 text-sm font-bold text-primary">
                            K{payment.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-xs">{payment.votes_count ?? '—'}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={payment.status} />
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                            {payment.transaction_id || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
