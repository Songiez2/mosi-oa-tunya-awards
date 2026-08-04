import React, { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Ticket, TicketPurchase } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Eye, CheckCircle, XCircle, Upload, Loader2 } from 'lucide-react';

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [purchases, setPurchases] = useState<TicketPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [viewingPurchase, setViewingPurchase] = useState<TicketPurchase | null>(null);

  const [ticketForm, setTicketForm] = useState<{
    name: string;
    description: string;
    price: number;
    total_quantity: number;
    event_date: string;
    image_url: string;
    status: 'active' | 'inactive' | 'sold_out';
  }>({
    name: '',
    description: '',
    price: 0,
    total_quantity: 0,
    event_date: '',
    image_url: '',
    status: 'active',
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (ticketsError) throw ticketsError;
      setTickets(ticketsData || []);

      // Fetch Purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('ticket_purchases')
        .select(`
          *,
          tickets (name),
          profiles (full_name, email, phone)
        `)
        .order('created_at', { ascending: false });
      if (purchasesError) throw purchasesError;
      setPurchases(purchasesData || []);
    } catch (error: any) {
      toast.error('Failed to load data', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tickets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('tickets')
        .getPublicUrl(filePath);

      setTicketForm(prev => ({ ...prev, image_url: data.publicUrl }));
      toast.success('Ticket image uploaded successfully');
    } catch (error: any) {
      toast.error('Upload failed', { description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleOpenTicketDialog = (ticket?: Ticket) => {
    if (ticket) {
      setEditingTicket(ticket);
      setTicketForm({
        name: ticket.name,
        description: ticket.description || '',
        price: ticket.price,
        total_quantity: ticket.total_quantity,
        event_date: ticket.event_date ? new Date(ticket.event_date).toISOString().slice(0, 16) : '',
        image_url: ticket.image_url || '',
        status: ticket.status,
      });
    } else {
      setEditingTicket(null);
      setTicketForm({
        name: '',
        description: '',
        price: 0,
        total_quantity: 100,
        event_date: '',
        image_url: '',
        status: 'active',
      });
    }
    setIsTicketDialogOpen(true);
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: ticketForm.name,
        description: ticketForm.description,
        price: ticketForm.price,
        total_quantity: ticketForm.total_quantity,
        event_date: ticketForm.event_date ? new Date(ticketForm.event_date).toISOString() : null,
        status: ticketForm.status,
      };

      if (editingTicket) {
        // Calculate new available quantity if total changed
        const qtyDiff = ticketForm.total_quantity - editingTicket.total_quantity;
        const newAvailable = editingTicket.available_quantity + qtyDiff;

        if (newAvailable < 0) {
          toast.error('Cannot reduce total below currently sold amount');
          return;
        }

        const { error } = await supabase
          .from('tickets')
          .update({ ...payload, available_quantity: newAvailable })
          .eq('id', editingTicket.id);
        if (error) throw error;
        toast.success('Ticket updated successfully');
      } else {
        const { error } = await supabase
          .from('tickets')
          .insert({ ...payload, available_quantity: ticketForm.total_quantity });
        if (error) throw error;
        toast.success('Ticket created successfully');
      }
      setIsTicketDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error('Operation failed', { description: error.message });
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ticket? (Cannot be deleted if purchases exist)')) return;
    try {
      const { error } = await supabase.from('tickets').delete().eq('id', id);
      if (error) throw error;
      toast.success('Ticket deleted');
      fetchData();
    } catch (error: any) {
      toast.error('Delete failed', { description: 'This ticket likely has associated purchases.' });
    }
  };

  const handlePurchaseStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('ticket_purchases')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Purchase marked as ${status}`);
      setIsPurchaseDialogOpen(false);
      fetchData(); // Trigger updates to quantities via DB trigger
    } catch (error: any) {
      toast.error('Failed to update status', { description: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gradient-gold">Tickets Management</h2>
      </div>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tickets">Tickets ({tickets.length})</TabsTrigger>
          <TabsTrigger value="purchases">Purchases ({purchases.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <Card className="glass-card border-border">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Ticket Types</CardTitle>
              <Button onClick={() => handleOpenTicketDialog()} size="sm" className="bg-gradient-gold text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Create Ticket
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Available / Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No tickets found</TableCell>
                      </TableRow>
                    ) : (
                      tickets.map(ticket => (
                        <TableRow key={ticket.id} className="border-border">
                          <TableCell className="font-medium">{ticket.name}</TableCell>
                          <TableCell>K{ticket.price.toLocaleString()}</TableCell>
                          <TableCell>{ticket.available_quantity} / {ticket.total_quantity}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              ticket.status === 'active' ? 'bg-success/20 text-success' : 
                              ticket.status === 'sold_out' ? 'bg-warning/20 text-warning' : 
                              'bg-muted text-muted-foreground'
                            }`}>
                              {ticket.status.toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenTicketDialog(ticket)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTicket(ticket.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No purchases yet</TableCell>
                      </TableRow>
                    ) : (
                      purchases.map(p => (
                        <TableRow key={p.id} className="border-border">
                          <TableCell className="text-xs whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="font-medium text-sm">{p.profiles?.full_name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{p.profiles?.phone || p.profiles?.email}</div>
                          </TableCell>
                          <TableCell className="text-sm">{p.tickets?.name || 'Deleted Ticket'}</TableCell>
                          <TableCell>{p.quantity}</TableCell>
                          <TableCell>K{p.total_amount.toLocaleString()}</TableCell>
                          <TableCell className="text-xs uppercase">{p.payment_mode}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              p.status === 'approved' ? 'bg-success/20 text-success' : 
                              p.status === 'rejected' ? 'bg-destructive/20 text-destructive' : 
                              'bg-warning/20 text-warning'
                            }`}>
                              {p.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => { setViewingPurchase(p); setIsPurchaseDialogOpen(true); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Ticket Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTicket ? 'Edit Ticket' : 'Create New Ticket'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTicketSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Ticket Name *</Label>
              <Input 
                value={ticketForm.name} 
                onChange={(e) => setTicketForm({...ticketForm, name: e.target.value})} 
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input 
                value={ticketForm.description} 
                onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Ticket Image (Optional)</Label>
              <div className="flex gap-2">
                <Input 
                  value={ticketForm.image_url} 
                  onChange={(e) => setTicketForm({...ticketForm, image_url: e.target.value})} 
                  placeholder="https://..."
                />
                <div className="relative">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <div className="h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </div>
                </div>
              </div>
              {ticketForm.image_url && (
                <div className="mt-2 h-32 rounded border border-border overflow-hidden">
                  <img src={ticketForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (K) *</Label>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={ticketForm.price} 
                  onChange={(e) => setTicketForm({...ticketForm, price: parseFloat(e.target.value) || 0})} 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Total Quantity *</Label>
                <Input 
                  type="number" 
                  min="1" 
                  value={ticketForm.total_quantity} 
                  onChange={(e) => setTicketForm({...ticketForm, total_quantity: parseInt(e.target.value) || 0})} 
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Date (Optional)</Label>
                <Input 
                  type="datetime-local" 
                  value={ticketForm.event_date} 
                  onChange={(e) => setTicketForm({...ticketForm, event_date: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={ticketForm.status} onValueChange={(val: any) => setTicketForm({...ticketForm, status: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="sold_out">Sold Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTicketDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-gold text-primary-foreground">Save Ticket</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Purchase Dialog */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Purchase</DialogTitle>
          </DialogHeader>
          {viewingPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">User</div>
                  <div className="font-medium">{viewingPurchase.profiles?.full_name}</div>
                  <div className="text-xs">{viewingPurchase.profiles?.phone || viewingPurchase.profiles?.email}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Ticket</div>
                  <div className="font-medium">{viewingPurchase.tickets?.name}</div>
                  <div className="text-xs">Qty: {viewingPurchase.quantity} @ K{viewingPurchase.total_amount.toLocaleString()}</div>
                </div>
              </div>

              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Payment Method</div>
                <div className="font-semibold uppercase">{viewingPurchase.payment_mode}</div>
                <div className="text-xs text-muted-foreground mt-2 mb-1">Current Status</div>
                <div className="font-bold">{viewingPurchase.status.toUpperCase()}</div>
              </div>

              {viewingPurchase.payment_mode === 'manual' && viewingPurchase.payment_proof && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Payment Proof</div>
                  <img 
                    src={viewingPurchase.payment_proof} 
                    alt="Proof" 
                    className="w-full rounded border border-border"
                  />
                </div>
              )}

              {viewingPurchase.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-success text-white hover:bg-success/90" onClick={() => handlePurchaseStatus(viewingPurchase.id, 'approved')}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve & Issue
                  </Button>
                  <Button className="flex-1 bg-destructive text-white hover:bg-destructive/90" onClick={() => handlePurchaseStatus(viewingPurchase.id, 'rejected')}>
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
