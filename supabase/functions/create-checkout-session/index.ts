// Use Deno's built-in HTTP server to avoid an external module dependency.

// ✅ 1. Définition des en-têtes CORS pour autoriser ton localhost (et le futur domaine)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Supabase Edge Functions run on Deno; this annotation is ignored by that runtime.
// @ts-ignore: Deno types may not be enabled in the local TypeScript project.
Deno.serve(async (req: Request) => {
  // ✅ 2. Gérer la requête "preflight" du navigateur (c'est ce qui bloquait avant)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ✅ 3. Vérifier que c'est bien une requête POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Méthode non autorisée' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ✅ 4. Récupérer les données envoyées par ton site
    const body = await req.json()
    const { title, message, type, userId } = body

    console.log(`🔔 [Edge Function] Notification reçue pour l'utilisateur ${userId}:`, { title, message, type })

    // ⚠️ TODO: C'est ici que tu ajouteras plus tard ta vraie logique 
    // (ex: insérer dans la table 'notifications' de Supabase, ou envoyer un vrai email).
    // Pour ce soir, on simule juste un succès pour débloquer ton interface !

    // ✅ 5. Répondre au site avec les en-têtes CORS (indispensable)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification traitée avec succès' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    // ✅ 6. Gérer les erreurs sans casser le CORS
    console.error('❌ Erreur dans send-notification:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur inconnue' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})