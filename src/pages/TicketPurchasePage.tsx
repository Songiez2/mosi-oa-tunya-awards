import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Ticket } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Loader2, Minus, Plus, CheckCircle } from 'lucide-react';

const uploadPaymentProof = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('payment-proofs')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('payment-proofs')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export default function TicketPurchasePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSettings();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [quantity, setQuantity] = useState(1);
  const [paymentMode, setPaymentMode] = useState<'automatic' | 'manual'>('automatic');
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/tickets');
      return;
    }
    fetchTicket();
  }, [id, user]);

  const fetchTicket = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      if (!data || data.status !== 'active') {
        toast.error('Ticket not available');
        navigate('/tickets');
        return;
      }
      setTicket(data);
    } catch (error: any) {
      toast.error('Failed to load ticket', { description: error.message });
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = ticket ? ticket.price * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !user) return;
    
    if (quantity > ticket.available_quantity) {
      toast.error(`Only ${ticket.available_quantity} tickets available`);
      return;
    }

    try {
      setSubmitting(true);
      
      let proofUrl = null;
      if (paymentMode === 'manual') {
        if (!proofFile) {
          toast.error('Payment proof is required for manual payments');
          return;
        }
        proofUrl = await uploadPaymentProof(proofFile);
      }

      if (paymentMode === 'automatic' && settings.lipila_enabled) {
        // Automatic Lipila flow (simulated/redirect)
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('ticket_purchases')
          .insert({
            ticket_id: ticket.id,
            user_id: user.id,
            quantity,
            total_amount: totalAmount,
            payment_mode: 'automatic',
            status: 'pending' // Would be updated by webhook
          })
          .select()
          .single();

        if (purchaseError) throw purchaseError;
        
        // Setup Lipila params
        const params = new URLSearchParams({
          amount: totalAmount.toString(),
          reference: purchaseData.id,
          type: 'ticket',
        });
        navigate(`/payment/process?${params.toString()}`);
        return;
      }

      // Manual flow
      const { error } = await supabase
        .from('ticket_purchases')
        .insert({
          ticket_id: ticket.id,
          user_id: user.id,
          quantity,
          total_amount: totalAmount,
          payment_mode: 'manual',
          payment_proof: proofUrl,
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success('Purchase submitted successfully', { 
        description: 'Your tickets will be issued once the payment is verified.' 
      });
      navigate('/profile'); // Redirect to profile to see My Tickets
      
    } catch (error: any) {
      toast.error('Purchase failed', { description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!ticket) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/tickets')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tickets
        </Button>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl text-gradient-gold">Complete Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary/50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-lg">{ticket.name}</h3>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-muted-foreground">Price per ticket</span>
                <span className="font-bold">K{ticket.price.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label>Quantity</Label>
                <div className="flex items-center gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setQuantity(Math.min(ticket.available_quantity, quantity + 1))}
                    disabled={quantity >= ticket.available_quantity}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg">Total Amount</span>
                  <span className="text-3xl font-bold text-primary">K{totalAmount.toLocaleString()}</span>
                </div>

                <div className="space-y-4">
                  <Label>Select Payment Method</Label>
                  <RadioGroup value={paymentMode} onValueChange={(val: any) => setPaymentMode(val)}>
                    {settings.lipila_enabled && (
                      <div className="flex items-center space-x-2 border border-border p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setPaymentMode('automatic')}>
                        <RadioGroupItem value="automatic" id="auto" />
                        <Label htmlFor="auto" className="cursor-pointer flex-1">
                          <span className="block font-semibold text-primary">Automatic Mobile Money (Lipila)</span>
                          <span className="text-xs text-muted-foreground block mt-1">Instant verification via MTN/Airtel/Zamtel</span>
                        </Label>
                      </div>
                    )}
                    
                    {settings.manual_verification && (
                      <div className="flex items-center space-x-2 border border-border p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setPaymentMode('manual')}>
                        <RadioGroupItem value="manual" id="manual" />
                        <Label htmlFor="manual" className="cursor-pointer flex-1">
                          <span className="block font-semibold">Manual Verification</span>
                          <span className="text-xs text-muted-foreground block mt-1">Send to {settings.mobile_money_number} and upload proof</span>
                        </Label>
                      </div>
                    )}
                  </RadioGroup>
                </div>

                {paymentMode === 'manual' && (
                  <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium mb-2">Manual Payment Instructions:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{settings.payment_instructions || `Please send K${totalAmount.toLocaleString()} to ${settings.mobile_money_number}`}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Upload Payment Proof (Screenshot)</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center bg-secondary/30 relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          required={paymentMode === 'manual'}
                        />
                        {proofFile ? (
                          <div className="text-center">
                            <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                            <p className="text-sm font-medium">{proofFile.name}</p>
                          </div>
                        ) : (
                          <div className="text-center pointer-events-none">
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm font-medium">Click or drag image here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground text-lg h-12 mt-8" disabled={submitting}>
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : `Pay K${totalAmount.toLocaleString()}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
