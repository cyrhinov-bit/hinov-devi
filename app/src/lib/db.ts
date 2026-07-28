import localforage from 'localforage';

export const db = {
  profiles: localforage.createInstance({ name: 'hinov', storeName: 'profiles' }),
  clients: localforage.createInstance({ name: 'hinov', storeName: 'clients' }),
  quotes: localforage.createInstance({ name: 'hinov', storeName: 'quotes' }),
  services: localforage.createInstance({ name: 'hinov', storeName: 'services' }),
  prestations: localforage.createInstance({ name: 'hinov', storeName: 'prestations' }),
  settings: localforage.createInstance({ name: 'hinov', storeName: 'settings' }),
  syncQueue: localforage.createInstance({ name: 'hinov', storeName: 'syncQueue' })
};
