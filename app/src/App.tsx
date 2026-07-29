import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { DashboardDirecteur } from './pages/DashboardDirecteur';
import { DashboardResponsable } from './pages/DashboardResponsable';
import { QuoteCreation } from './pages/QuoteCreation';
import { ClientPortal } from './pages/ClientPortal';

import { Clients } from './pages/Clients';
import { Services } from './pages/Services';
import { Prestations } from './pages/Prestations';
import { Devis } from './pages/Devis';
import { Documents } from './pages/Documents';
import { Utilisateurs } from './pages/Utilisateurs';
import { Rapports } from './pages/Rapports';
import { Parametres } from './pages/Parametres';
import { Login } from './pages/Login';

import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const queryClient = new QueryClient();

function ProtectedRoute() {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--color-background)', color: 'var(--color-primary)' }}>
        <h2>Hinov Devis</h2>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Composant pour rediriger automatiquement vers le bon dashboard selon le rôle
function RoleBasedDashboard() {
  const { currentUser, loading } = useAuth();
  
  if (loading) return null; // Le ProtectedRoute gère déjà l'affichage du chargement

  if (!currentUser) return <Navigate to="/login" replace />;
  
  if (currentUser.role === 'Directeur') return <DashboardDirecteur />;
  if (currentUser.role === 'Responsable') return <DashboardResponsable />;
  
  // Seuls les rôles Directeur et Responsable existent
  return <DashboardDirecteur />;
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              {/* Route publique de connexion */}
              <Route path="/login" element={<Login />} />
              <Route path="/portail-client/:id" element={<ClientPortal />} />

              {/* Routes protégées */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<RoleBasedDashboard />} />
                  
                  <Route path="clients" element={<Clients />} />
                  <Route path="services" element={<Services />} />
                  <Route path="prestations" element={<Prestations />} />
                  <Route path="devis" element={<Devis />} />
                  <Route path="devis/nouveau" element={<QuoteCreation />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="utilisateurs" element={<Utilisateurs />} />
                  <Route path="rapports" element={<Rapports />} />
                  <Route path="parametres" element={<Parametres />} />
                  
                  <Route path="*" element={<div style={{ padding: '20px' }}><h1>Page introuvable</h1></div>} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
