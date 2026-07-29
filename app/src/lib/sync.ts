import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { supabase } from './supabase';

export type SyncActionType = 'INSERT_CLIENT' | 'UPDATE_CLIENT' | 'DELETE_CLIENT' | 
                             'INSERT_QUOTE' | 'UPDATE_QUOTE' | 'DELETE_QUOTE' |
                             'UPDATE_SETTINGS' | 'UPDATE_PROFILE' | 'DELETE_PROFILE' |
                             'INSERT_PRESTATION' | 'DELETE_PRESTATION' |
                             'INSERT_SERVICE' | 'UPDATE_SERVICE' | 'DELETE_SERVICE';

export interface SyncAction {
  id: string;
  type: SyncActionType;
  payload: any;
  timestamp: number;
}

// Ajouter une action à la file d'attente
export const queueSyncAction = async (type: SyncActionType, payload: any) => {
  const action: SyncAction = {
    id: uuidv4(),
    type,
    payload,
    timestamp: Date.now()
  };
  
  const currentQueue: SyncAction[] = (await db.syncQueue.getItem('queue')) || [];
  currentQueue.push(action);
  await db.syncQueue.setItem('queue', currentQueue);
  
  // Tenter de synchroniser immédiatement si on est en ligne
  if (navigator.onLine) {
    processSyncQueue();
  }
};

// Vider la file d'attente
export const processSyncQueue = async () => {
  const currentQueue: SyncAction[] = (await db.syncQueue.getItem('queue')) || [];
  if (currentQueue.length === 0) return;

  const remainingQueue = [...currentQueue];

  for (const action of currentQueue) {
    try {
      let success = false;
      
      switch (action.type) {
        case 'INSERT_CLIENT': {
          const { error } = await supabase.from('clients').insert([action.payload]);
          if (error) console.error('[Sync] INSERT_CLIENT échoué :', error.message);
          success = !error;
          break;
        }
        case 'UPDATE_CLIENT': {
          const { id, ...data } = action.payload;
          const { error } = await supabase.from('clients').update(data).eq('id', id);
          success = !error;
          break;
        }
        case 'DELETE_CLIENT': {
          const { error } = await supabase.from('clients').delete().eq('id', action.payload.id);
          success = !error;
          break;
        }
        case 'INSERT_QUOTE': {
          const { lines, ...quoteData } = action.payload;
          const { error } = await supabase.from('quotes').insert([{
            id: quoteData.id,
            quote_number: quoteData.quoteNumber,
            client_id: quoteData.clientId,
            commercial_id: quoteData.commercialId,
            subject: quoteData.subject,
            subtotal: quoteData.subtotal,
            vat: quoteData.vat,
            total: quoteData.total,
            status: quoteData.status,
            date: quoteData.date,
            style: quoteData.style,
            accent_color: quoteData.accentColor,
            discount_percent: quoteData.discountPercent || 0,
            discount_amount: quoteData.discountAmount || 0
          }]);
          
          if (!error && lines && lines.length > 0) {
            const linesData = lines.map((l: any) => ({
              id: l.id,
              quote_id: quoteData.id,
              prestation_id: l.prestationId,
              description: l.description,
              quantity: l.quantity,
              unit_price: l.unitPrice,
              total: l.total
            }));
            await supabase.from('quote_lines').insert(linesData);
            success = true;
          } else if (!error) {
            success = true;
          }
          break;
        }
        case 'UPDATE_QUOTE': {
          const { lines, ...quoteData } = action.payload;
          const { error } = await supabase.from('quotes').update({
            quote_number: quoteData.quoteNumber,
            client_id: quoteData.clientId,
            commercial_id: quoteData.commercialId,
            subject: quoteData.subject,
            subtotal: quoteData.subtotal,
            vat: quoteData.vat,
            total: quoteData.total,
            status: quoteData.status,
            date: quoteData.date,
            style: quoteData.style,
            accent_color: quoteData.accentColor,
            discount_percent: quoteData.discountPercent || 0,
            discount_amount: quoteData.discountAmount || 0
          }).eq('id', quoteData.id);

          if (!error) {
            await supabase.from('quote_lines').delete().eq('quote_id', quoteData.id);
            if (lines && lines.length > 0) {
              const linesData = lines.map((l: any) => ({
                id: l.id,
                quote_id: quoteData.id,
                prestation_id: l.prestationId,
                description: l.description,
                quantity: l.quantity,
                unit_price: l.unitPrice,
                total: l.total
              }));
              await supabase.from('quote_lines').insert(linesData);
            }
            success = true;
          }
          break;
        }
        case 'DELETE_QUOTE': {
          const { error } = await supabase.from('quotes').delete().eq('id', action.payload.id);
          success = !error;
          break;
        }
        case 'UPDATE_SETTINGS': {
          const { error } = await supabase.from('settings').update({
            company_name: action.payload.companyName,
            company_logo: action.payload.companyLogo,
            company_address: action.payload.companyAddress,
            company_siret: action.payload.companySiret,
            company_tva: action.payload.companyTva,
            default_terms: action.payload.defaultTerms,
            header_logo_base64: action.payload.headerLogoBase64 ?? null,
            default_vat: action.payload.defaultVat ?? null,
            default_validity: action.payload.defaultValidity ?? null,
          }).eq('id', 1);
          if (error) console.error('[Sync] UPDATE_SETTINGS échoué :', error.message);
          success = !error;
          break;
        }
        case 'UPDATE_PROFILE': {
          const { id, ...updateData } = action.payload;
          const { error } = await supabase.from('profiles').update(updateData).eq('id', id);
          if (error) console.error('[Sync] UPDATE_PROFILE échoué :', error.message);
          success = !error;
          break;
        }
        case 'DELETE_PROFILE': {
          const { error } = await supabase.from('profiles').delete().eq('id', action.payload.id);
          success = !error;
          break;
        }
        case 'INSERT_PRESTATION': {
          const { error } = await supabase.from('prestations').insert([{
            id: action.payload.id, code: action.payload.code, name: action.payload.name, description: action.payload.description, price: action.payload.price, service_id: action.payload.serviceId, unit: action.payload.unit
          }]);
          if (error) console.error('[Sync] INSERT_PRESTATION échoué :', error.message);
          success = !error;
          break;
        }
        case 'DELETE_PRESTATION': {
          const { error } = await supabase.from('prestations').delete().eq('id', action.payload.id);
          success = !error;
          break;
        }
        case 'INSERT_SERVICE': {
          const { error } = await supabase.from('services').insert([{
            id: action.payload.id, name: action.payload.name, description: action.payload.description, members: action.payload.members
          }]);
          if (error) console.error('[Sync] INSERT_SERVICE échoué :', error.message);
          success = !error;
          break;
        }
        case 'UPDATE_SERVICE': {
          const { id, ...updateData } = action.payload;
          const { error } = await supabase.from('services').update(updateData).eq('id', id);
          if (error) console.error('[Sync] UPDATE_SERVICE échoué :', error.message);
          success = !error;
          break;
        }
        case 'DELETE_SERVICE': {
          const { error } = await supabase.from('services').delete().eq('id', action.payload.id);
          success = !error;
          break;
        }
        default:
          success = true; // Ignore unknown actions
      }

      if (success) {
        // Enlever de la file d'attente
        const index = remainingQueue.findIndex(a => a.id === action.id);
        if (index !== -1) {
          remainingQueue.splice(index, 1);
        }
      } else {
        // En cas d'erreur réseau, on arrête de traiter la suite pour respecter l'ordre
        break;
      }
    } catch (e) {
      console.error('Erreur de synchronisation pour l\'action', action, e);
      break; // Stop sur la première erreur réseau
    }
  }

  // Sauvegarder la file d'attente restante
  await db.syncQueue.setItem('queue', remainingQueue);
};

// Ecouter les retours de connexion
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Connexion rétablie. Synchronisation en cours...');
    processSyncQueue();
  });
}
