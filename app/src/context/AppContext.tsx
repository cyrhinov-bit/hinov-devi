import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { db } from '../lib/db';
import { queueSyncAction } from '../lib/sync';
import { v4 as uuidv4 } from 'uuid';

export interface User { id: string; name: string; email: string; role: 'Directeur' | 'Responsable'; serviceId?: string; pin: string; lastLogin: string; active: boolean; }
export interface Client { id: string; name: string; email: string; phone: string; contact: string; company: string; address: string; status?: string; }
export interface Service { id: string; name: string; description: string; members?: number; }
export interface Prestation { id: string; code: string; name: string; description: string; price: number; serviceId: string; unit?: string; }
export interface QuoteLine { id: string; prestationId: string; description: string; quantity: number; unitPrice: number; total: number; }
export interface Quote { id: string; quoteNumber: string; clientId: string; commercialId: string; subject: string; lines: QuoteLine[]; subtotal: number; vat: number; total: number; status: 'Brouillon' | 'Envoyé' | 'Accepté' | 'Refusé'; date: string; style?: 'Classique' | 'Moderne' | 'Minimaliste'; accentColor?: string; }
export interface AppSettings { companyName: string; companyLogo: string; companyAddress: string; companySiret: string; companyTva: string; defaultTerms: string; headerLogoBase64?: string; defaultVat?: number; defaultValidity?: number; }

interface AppState {
  users: User[]; clients: Client[]; quotes: Quote[]; settings: AppSettings; services: Service[]; prestations: Prestation[]; loading: boolean;
  addClient: (client: Client) => Promise<void>;
  updateClient: (id: string, client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addQuote: (quote: Quote) => Promise<void>;
  updateQuote: (id: string, quote: Quote) => Promise<void>;
  updateQuoteStatus: (id: string, status: Quote['status']) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
  addUser: (user: User) => Promise<void>;
  updateUser: (id: string, data: Pick<User, 'name' | 'role' | 'serviceId'>) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addPrestation: (prestation: Prestation) => Promise<void>;
  deletePrestation: (id: string) => Promise<void>;
  addService: (service: Service) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const defaultSettings: AppSettings = { companyName: 'Hinov', companyLogo: '', companyAddress: '', companySiret: '', companyTva: '', defaultTerms: '' };

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load from offline cache first, then fetch from Supabase if online
  const refreshData = async () => {
    setLoading(true);
    try {
      // 1. Load from IndexedDB (Offline Cache)
      const cachedUsers = await db.profiles.getItem<User[]>('data');
      const cachedClients = await db.clients.getItem<Client[]>('data');
      const cachedQuotes = await db.quotes.getItem<Quote[]>('data');
      const cachedServices = await db.services.getItem<Service[]>('data');
      const cachedPrestations = await db.prestations.getItem<Prestation[]>('data');
      const cachedSettings = await db.settings.getItem<AppSettings>('data');

      if (cachedUsers) setUsers(cachedUsers);
      if (cachedClients) setClients(cachedClients);
      if (cachedQuotes) setQuotes(cachedQuotes);
      if (cachedServices) setServices(cachedServices);
      if (cachedPrestations) setPrestations(cachedPrestations);
      if (cachedSettings) setSettings(cachedSettings);

      // 2. Fetch from Supabase (if online) and update Cache
      if (navigator.onLine && currentUser) {
        const [
          { data: profilesData }, { data: clientsData }, { data: servicesData },
          { data: prestationsData }, { data: settingsData }, { data: quotesData }
        ] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('clients').select('*'),
          supabase.from('services').select('*'),
          supabase.from('prestations').select('*'),
          supabase.from('settings').select('*').single(),
          supabase.from('quotes').select('*, quote_lines(*)')
        ]);

        if (profilesData) {
          const parsedUsers = profilesData.map(p => ({
            id: p.id,
            name: p.name,
            email: p.email,
            role: p.role as User['role'],
            serviceId: p.service_id,
            pin: p.pin,
            lastLogin: p.last_login,
            active: p.active !== false, // true par défaut si null
          }));
          setUsers(parsedUsers); await db.profiles.setItem('data', parsedUsers);
        }
        if (clientsData) {
          setClients(clientsData as Client[]); await db.clients.setItem('data', clientsData);
        }
        if (servicesData) {
          setServices(servicesData as Service[]); await db.services.setItem('data', servicesData);
        }
        if (prestationsData) {
          const parsedPrestations = prestationsData.map(p => ({...p, serviceId: p.service_id})) as Prestation[];
          setPrestations(parsedPrestations); await db.prestations.setItem('data', parsedPrestations);
        }
        if (settingsData) {
          const parsedSettings: AppSettings = {
            companyName: settingsData.company_name,
            companyLogo: settingsData.company_logo,
            companyAddress: settingsData.company_address,
            companySiret: settingsData.company_siret,
            companyTva: settingsData.company_tva,
            defaultTerms: settingsData.default_terms,
            headerLogoBase64: settingsData.header_logo_base64 ?? undefined,
            defaultVat: settingsData.default_vat ?? undefined,
            defaultValidity: settingsData.default_validity ?? undefined,
          };
          setSettings(parsedSettings); await db.settings.setItem('data', parsedSettings);
        }
        if (quotesData) {
          const parsedQuotes = quotesData.map(q => ({
            id: q.id, quoteNumber: q.quote_number, clientId: q.client_id, commercialId: q.commercial_id, subject: q.subject, subtotal: q.subtotal, vat: q.vat, total: q.total, status: q.status, date: q.date, style: q.style, accentColor: q.accent_color,
            lines: q.quote_lines.map((l: any) => ({ id: l.id, prestationId: l.prestation_id, description: l.description, quantity: l.quantity, unitPrice: l.unit_price, total: l.total }))
          }));
          setQuotes(parsedQuotes); await db.quotes.setItem('data', parsedQuotes);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, [currentUser]);

  // MUTATIONS (Offline First)
  const addClient = async (client: Client) => {
    // Generate UUID if it's not a valid UUID (e.g. if it was Date.now())
    const newClient = { ...client, id: client.id.length > 20 ? client.id : uuidv4() };
    const newClients = [...clients, newClient];
    setClients(newClients);
    await db.clients.setItem('data', newClients);
    await queueSyncAction('INSERT_CLIENT', newClient);
  };

  const updateClient = async (id: string, client: Client) => {
    const newClients = clients.map(c => c.id === id ? { ...client, id } : c);
    setClients(newClients);
    await db.clients.setItem('data', newClients);
    await queueSyncAction('UPDATE_CLIENT', { ...client, id });
  };

  const deleteClient = async (id: string) => {
    const newClients = clients.filter(c => c.id !== id);
    setClients(newClients);
    await db.clients.setItem('data', newClients);
    await queueSyncAction('DELETE_CLIENT', { id });
  };

  const addQuote = async (quote: Quote) => {
    // Generate true UUIDs for DB compatibility if they used Date.now()
    const quoteId = quote.id.length > 20 ? quote.id : uuidv4();
    const newQuote = { 
      ...quote, 
      id: quoteId, 
      lines: quote.lines.map(l => ({ ...l, id: l.id.length > 20 ? l.id : uuidv4() }))
    };
    
    const newQuotes = [...quotes, newQuote];
    setQuotes(newQuotes);
    await db.quotes.setItem('data', newQuotes);
    await queueSyncAction('INSERT_QUOTE', newQuote);
  };

  const updateQuote = async (id: string, quote: Quote) => {
    const newQuote = {
      ...quote,
      lines: quote.lines.map(l => ({ ...l, id: l.id.length > 20 ? l.id : uuidv4() }))
    };
    const newQuotes = quotes.map(q => q.id === id ? newQuote : q);
    setQuotes(newQuotes);
    await db.quotes.setItem('data', newQuotes);
    await queueSyncAction('UPDATE_QUOTE', newQuote);
  };

  const updateQuoteStatus = async (id: string, status: Quote['status']) => {
    const quote = quotes.find(q => q.id === id);
    if (!quote) return;
    const newQuote = { ...quote, status };
    const newQuotes = quotes.map(q => q.id === id ? newQuote : q);
    setQuotes(newQuotes);
    await db.quotes.setItem('data', newQuotes);
    await queueSyncAction('UPDATE_QUOTE', newQuote);
  };

  const deleteQuote = async (id: string) => {
    const newQuotes = quotes.filter(q => q.id !== id);
    setQuotes(newQuotes);
    await db.quotes.setItem('data', newQuotes);
    await queueSyncAction('DELETE_QUOTE', { id });
  };

  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await db.settings.setItem('data', newSettings);
    await queueSyncAction('UPDATE_SETTINGS', newSettings);
  };

  const addPrestation = async (prestation: Prestation) => {
    const newPrestations = [...prestations, { ...prestation, id: prestation.id.length > 20 ? prestation.id : uuidv4() }];
    setPrestations(newPrestations);
    await db.prestations.setItem('data', newPrestations);
    await queueSyncAction('INSERT_PRESTATION', newPrestations[newPrestations.length - 1]);
  };

  const deletePrestation = async (id: string) => {
    const newPrestations = prestations.filter(p => p.id !== id);
    setPrestations(newPrestations);
    await db.prestations.setItem('data', newPrestations);
    await queueSyncAction('DELETE_PRESTATION', { id });
  };

  const addService = async (service: Service) => {
    const newServices = [...services, { ...service, id: service.id.length > 20 ? service.id : uuidv4() }];
    setServices(newServices);
    await db.services.setItem('data', newServices);
    await queueSyncAction('INSERT_SERVICE', newServices[newServices.length - 1]);
  };

  const updateService = async (id: string, service: Partial<Service>) => {
    const newServices = services.map(s => s.id === id ? { ...s, ...service } : s);
    setServices(newServices);
    await db.services.setItem('data', newServices);
    await queueSyncAction('UPDATE_SERVICE', { id, name: service.name, description: service.description, members: service.members });
  };

  const deleteService = async (id: string) => {
    const newServices = services.filter(s => s.id !== id);
    setServices(newServices);
    await db.services.setItem('data', newServices);
    await queueSyncAction('DELETE_SERVICE', { id });
  };

  // Création d'utilisateur via Edge Function (service_role) pour ne pas écraser la session du Directeur
  const addUser = async (user: User) => {
    if (!navigator.onLine) { alert("Vous devez être en ligne pour créer un utilisateur."); return; }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert('Session expirée. Veuillez vous reconnecter.'); return; }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: user.email,
          pin: user.pin,
          name: user.name,
          role: user.role,
          serviceId: user.serviceId || null,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      alert(`Erreur : ${result.error || 'Impossible de créer l\'utilisateur.'}`);
      return;
    }

    // Ajouter le nouvel utilisateur à l'état local et au cache
    const newUser: User = {
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.role,
      serviceId: result.serviceId,
      pin: user.pin,
      lastLogin: 'Jamais',
      active: true,
    };
    const newUsers = [...users, newUser];
    setUsers(newUsers);
    await db.profiles.setItem('data', newUsers);
  };

  const updateUser = async (id: string, data: Pick<User, 'name' | 'role' | 'serviceId'>) => {
    const newUsers = users.map(u => u.id === id ? { ...u, ...data } : u);
    setUsers(newUsers);
    await db.profiles.setItem('data', newUsers);
    await queueSyncAction('UPDATE_PROFILE', { id, name: data.name, role: data.role, service_id: data.serviceId || null });
  };

  const toggleUserStatus = async (id: string) => {
    const targetUser = users.find(u => u.id === id);
    if (!targetUser) return;
    const updatedActive = !targetUser.active;
    const newUsers = users.map(u => u.id === id ? { ...u, active: updatedActive } : u);
    setUsers(newUsers);
    await db.profiles.setItem('data', newUsers);
    await queueSyncAction('UPDATE_PROFILE', { id, active: updatedActive });
  };

  const deleteUser = async (id: string) => {
    const newUsers = users.filter(u => u.id !== id);
    setUsers(newUsers);
    await db.profiles.setItem('data', newUsers);
    await queueSyncAction('DELETE_PROFILE', { id });
  };

  return (
    <AppContext.Provider value={{ users, clients, quotes, settings, services, prestations, loading, addClient, updateClient, deleteClient, addQuote, updateQuote, updateQuoteStatus, deleteQuote, updateSettings, addUser, updateUser, toggleUserStatus, deleteUser, addPrestation, deletePrestation, addService, updateService, deleteService, refreshData }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
