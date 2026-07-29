// @ts-nocheck — Ce fichier tourne sur le runtime Deno (Supabase Edge Functions), pas Node.js.
// Les erreurs "Cannot find name 'Deno'" et les imports HTTP sont normaux dans ce contexte.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Cette Edge Function tourne côté serveur avec le service_role key.
// Elle crée un auth.user + un profil sans toucher à la session du client appelant.
Deno.serve(async (req: Request) => {
  // Autoriser les requêtes CORS depuis l'app
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    // Vérifier que l'appelant est bien un utilisateur authentifié (Directeur)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non autorisé.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Client avec le service_role key pour les opérations admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Vérifier que l'appelant est un Directeur
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: caller }, error: callerError } = await supabaseClient.auth.getUser();
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: 'Session invalide.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (!callerProfile || callerProfile.role !== 'Directeur') {
      return new Response(JSON.stringify({ error: 'Seul un Directeur peut créer des utilisateurs.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Lire les données du nouvel utilisateur
    const { email, pin, name, role, serviceId } = await req.json();

    if (!email || !pin || !name || !role) {
      return new Response(JSON.stringify({ error: 'Champs obligatoires manquants : email, pin, name, role.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (!['Directeur', 'Responsable'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Rôle invalide. Valeurs acceptées : Directeur, Responsable.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Créer l'utilisateur dans auth.users avec le service_role (sans toucher à la session cliente)
    const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: pin,
      email_confirm: true, // Confirmer l'email automatiquement
    });

    if (authError || !newAuthUser.user) {
      return new Response(JSON.stringify({ error: authError?.message ?? 'Erreur création compte auth.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Insérer le profil dans la table profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: newAuthUser.user.id,
        name,
        email,
        role,
        service_id: serviceId || null,
        pin,
        last_login: 'Jamais',
      }])
      .select()
      .single();

    if (profileError) {
      // Supprimer le compte auth créé si l'insert du profil échoue (rollback manuel)
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Retourner le profil créé
    return new Response(
      JSON.stringify({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        serviceId: profile.service_id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erreur serveur inattendue.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
