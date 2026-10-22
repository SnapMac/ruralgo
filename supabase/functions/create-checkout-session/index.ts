// @ts-ignore Deno resolves this URL import at runtime; TypeScript tooling may not.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore Deno resolves this URL import at runtime; TypeScript tooling may not.
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";

// @ts-ignore Deno provides this global at runtime; browser TypeScript tooling may not.
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const { amount, userId, userEmail } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'Recharge de portefeuille RuralGo',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/?payment_success=true&amount=${amount}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/?payment_canceled=true`,
      metadata: {
        userId: userId,
        amount: amount
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    });
  }
});