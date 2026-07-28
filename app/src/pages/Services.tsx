import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { Service } from '../context/AppContext';

export function Services() {
  const { services, users, addService, deleteService } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({});

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newService.name) {
      addService({
        id: Date.now().toString(),
        name: newService.name,
        members: newService.members || 1
      });
      setShowForm(false);
      setNewService({});
    }
  };

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Départements / Services</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} style={{ marginRight: '8px' }} /> Ajouter un service
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3>Nouveau service</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <input className="table-input" placeholder="Nom du service" required onChange={e => setNewService({...newService, name: e.target.value})} />
            <input className="table-input" type="number" placeholder="Nombre de membres (ex: 3)" min="1" onChange={e => setNewService({...newService, members: Number(e.target.value)})} />
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
              <th>Service</th>
              <th>Responsable</th>
              <th>Membres d'équipe</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => {
              const managerName = users.find(u => u.serviceId === s.id && u.role === 'Responsable')?.name || 'Non assigné';
              return (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{managerName}</td>
                  <td>{s.members}</td>
                  <td>
                    <button className="icon-button" style={{ color: 'var(--color-primary)' }}><Edit2 size={16} /></button>
                    <button className="icon-button text-error" onClick={() => deleteService(s.id)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              );
            })}
            {services.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>Aucun service trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
