import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useConfirm } from '../components/ConfirmModal';
import type { Client } from '../context/AppContext';

export function Clients() {
  const { clients, addClient, deleteClient } = useAppContext();
  const { confirm } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({});

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClient.name || newClient.contact) {
      addClient({
        id: Date.now().toString(),
        name: newClient.name || '',
        contact: newClient.contact || '',
        email: newClient.email || '',
        phone: newClient.phone || '',
        company: newClient.company || '',
        address: newClient.address || '',
        status: 'Actif'
      });
      setShowForm(false);
      setNewClient({});
    }
  };

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Gestion des Clients</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} style={{ marginRight: '8px' }} /> Nouveau Client
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3>Ajouter un client</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <input className="table-input" placeholder="Entreprise" onChange={e => setNewClient({...newClient, name: e.target.value})} />
            <input className="table-input" placeholder="Responsable" required onChange={e => setNewClient({...newClient, contact: e.target.value})} />
            <input className="table-input" placeholder="Email" type="email" required onChange={e => setNewClient({...newClient, email: e.target.value})} />
            <input className="table-input" placeholder="Téléphone" required onChange={e => setNewClient({...newClient, phone: e.target.value})} />
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
              <th>Entreprise</th>
              <th>Responsable</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.contact}</td>
                <td>{client.email}</td>
                <td>{client.phone}</td>
                <td><span className={`badge-status ${client.status === 'Actif' ? 'bg-success' : 'bg-error'}`}>{client.status}</span></td>
                <td>
                  <button className="icon-button" style={{ color: 'var(--color-primary)' }}><Edit2 size={16} /></button>
                  <button
                    className="icon-button text-error"
                    onClick={() => confirm({
                      title: 'Supprimer le client',
                      message: `Êtes-vous sûr de vouloir supprimer le client "${client.name}" ?`,
                      confirmLabel: 'Supprimer',
                      onConfirm: () => deleteClient(client.id)
                    })}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Aucun client trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
