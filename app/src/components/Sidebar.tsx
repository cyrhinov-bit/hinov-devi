import React from 'react';
import { Home, Users, Briefcase, FileText, Folder, Shield, PieChart, Settings, UserCircle, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems: { label: string; icon: React.ElementType; path: string; roles: Array<'Directeur' | 'Responsable'> }[] = [
    { label: 'Dashboard', icon: Home, path: '/', roles: ['Directeur', 'Responsable'] },
    { label: 'Clients', icon: Users, path: '/clients', roles: ['Directeur', 'Responsable'] },
    { label: 'Services', icon: Briefcase, path: '/services', roles: ['Directeur'] },
    { label: 'Prestations', icon: FileText, path: '/prestations', roles: ['Directeur'] },
    { label: 'Devis', icon: FileText, path: '/devis', roles: ['Directeur', 'Responsable'] },
    { label: 'Documents', icon: Folder, path: '/documents', roles: ['Directeur', 'Responsable'] },
    { label: 'Utilisateurs', icon: Shield, path: '/utilisateurs', roles: ['Directeur'] },
    { label: 'Rapports', icon: PieChart, path: '/rapports', roles: ['Directeur'] },
    { label: 'Paramètres', icon: Settings, path: '/parametres', roles: ['Directeur'] },
  ];

  // Filtrer les éléments selon le rôle de l'utilisateur connecté
  const visibleNavItems = navItems.filter(item => 
    currentUser ? item.roles.includes(currentUser.role) : false
  );

  return (
    <aside className="sidebar">
      <div className="user-profile">
        <div className="avatar">
          <UserCircle size={48} />
        </div>
        <div className="user-info">
          <div className="user-name">{currentUser?.name || 'Utilisateur'}</div>
          <div className="user-role">{currentUser?.role || 'Aucun rôle'}</div>
        </div>
      </div>
      <nav className="nav-menu">
        <ul className="nav-list">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <li key={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                <Link to={item.path} className="nav-link">
                  <item.icon className="nav-icon" size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={{ padding: '16px', marginTop: 'auto', borderTop: '1px solid var(--color-border)' }}>
        <button 
          onClick={handleLogout}
          style={{ 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            padding: '10px',
            backgroundColor: 'var(--color-primary)',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}
        >
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}
