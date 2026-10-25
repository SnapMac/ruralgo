import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  try {
    // Vérifier que c'est bien Stripe qui envoie le webhook
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const amount = parseFloat(session.metadata?.amount || '0');

      if (userId && amount > 0) {
        // Récupérer le solde actuel
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', userId)
          .single();

        const currentBalance = wallet?.balance || 0;
        const newBalance = currentBalance + amount;

        // Mettre à jour le solde
        await supabase
          .from('wallets')
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq('user_id', userId);

        // Ajouter la transaction
        await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'deposit',
            amount: amount,
            balance_before: currentBalance,
            balance_after: newBalance,
            description: `Recharge via Stripe (Session: ${session.id})`,
            status: 'completed'
          });

        console.log(`✅ Solde mis à jour pour ${userId}: +${amount}$`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Erreur webhook:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});