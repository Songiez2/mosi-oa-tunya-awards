import React, { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Ticket } from '@/types/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Ticket as TicketIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('status', 'active')
        .order('event_date', { ascending: true });
        
      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Failed to load tickets', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (ticketId: string) => {
    if (!user) {
      navigate(`/login?redirect=/tickets`);
      return;
    }
    navigate(`/tickets/purchase/${ticketId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient-gold mb-4">Event Tickets</h1>
          <p className="text-muted-foreground">Secure your spot at the MOSI-OA TUNYA AWARDS events.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <Card className="glass-card text-center py-12">
            <CardContent>
              <TicketIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Tickets Available</h3>
              <p className="text-muted-foreground">Check back later for upcoming event tickets.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map(ticket => (
              <Card key={ticket.id} className="glass-card hover-gold transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">{ticket.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ticket.description && (
                    <p className="text-sm text-muted-foreground">{ticket.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center bg-secondary/50 p-3 rounded-lg">
                    <div>
                      <div className="text-xs text-muted-foreground">Price</div>
                      <div className="text-2xl font-bold">K{ticket.price.toLocaleString()}</div>
                    </div>
                    {ticket.event_date && (
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                          <Calendar className="w-3 h-3" /> Date
                        </div>
                        <div className="text-sm font-medium">
                          {new Date(ticket.event_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {ticket.available_quantity > 0 ? (
                      <span className="text-success">{ticket.available_quantity} tickets available</span>
                    ) : (
                      <span className="text-destructive font-bold">Sold Out</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-gradient-gold text-primary-foreground font-semibold"
                    disabled={ticket.available_quantity <= 0}
                    onClick={() => handlePurchase(ticket.id)}
                  >
                    {ticket.available_quantity > 0 ? 'Buy Ticket' : 'Sold Out'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
