import { useState } from 'react';
import { Plus, Edit2, UserX } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { User } from '../context/AppContext';

export function Utilisateurs() {
  const { users, services, addUser, deleteUser } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', role: 'Responsable', serviceId: '', pin: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.pin) {
      alert('Veuillez remplir l\'e-mail et le code PIN.');
      return;
    }
    if (newUser.pin.length !== 6) {
      alert('Le code PIN doit contenir exactement 6 chiffres.');
      return;
    }
    const name = newUser.email.split('@')[0].replace('.', ' ').toUpperCase();
    addUser({
      id: Date.now().toString(),
      name: name,
      email: newUser.email,
      role: newUser.role as User['role'],
      serviceId: newUser.serviceId,
      pin: newUser.pin,
      lastLogin: 'Jamais'
    });
    setShowForm(false);
    setNewUser({ email: '', role: 'Responsable', serviceId: '', pin: '' });
  };

  const getServiceName = (id?: string) => {
    if (!id) return '-';
    return services.find(s => s.id === id)?.name || 'Inconnu';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Directeur': return 'var(--color-error)';
      case 'Responsable': return '#2196F3';
      default: return 'var(--color-text-muted)';
    }
  };

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Gestion des Utilisateurs</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} style={{ marginRight: '8px' }} /> Nouvel Utilisateur
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3>Ajouter un utilisateur</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Adresse e-mail *</label>
              <input type="email" className="table-input" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="Ex: collaborateur@hinov.com" required />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Code PIN (6 chiffres) *</label>
              <input type="password" maxLength={6} pattern="\d{6}" className="table-input" value={newUser.pin} onChange={e => setNewUser({...newUser, pin: e.target.value.replace(/\D/g, '')})} placeholder="******" required />
            </div>

            <select className="table-input" required value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="Responsable">Responsable</option>
              <option value="Directeur">Directeur</option>
            </select>

            <select className="table-input" value={newUser.serviceId || ''} onChange={e => setNewUser({ ...newUser, serviceId: e.target.value })}>
              <option value="">Sélectionner un service (Optionnel)</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
              <button type="submit" className="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Service</th>
              <th>Dernière connexion</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className="badge-status" style={{ backgroundColor: getRoleColor(u.role) }}>{u.role}</span></td>
                <td>{getServiceName(u.serviceId)}</td>
                <td>{u.lastLogin}</td>
                <td>
                  <button className="icon-button" style={{ color: 'var(--color-primary)' }}><Edit2 size={16} /></button>
                  {u.role !== 'Directeur' && (
                    <button className="icon-button text-error" onClick={() => deleteUser(u.id)}><UserX size={16} /></button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Aucun utilisateur trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
