import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useConfirm } from '../components/ConfirmModal';
import type { Prestation } from '../context/AppContext';

export function Prestations() {
  const { prestations, services, addPrestation, deletePrestation } = useAppContext();
  const { confirm } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [newPrestation, setNewPrestation] = useState<Partial<Prestation>>({ unit: 'Jour' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPrestation.name && newPrestation.code && newPrestation.price && newPrestation.serviceId) {
      addPrestation({
        id: Date.now().toString(),
        code: newPrestation.code,
        name: newPrestation.name,
        serviceId: newPrestation.serviceId,
        price: Number(newPrestation.price),
        unit: newPrestation.unit || 'Jour',
        description: newPrestation.description || ''
      });
      setShowForm(false);
      setNewPrestation({ unit: 'Jour' });
    }
  };

  const getServiceName = (id: string) => services.find(s => s.id === id)?.name || 'Inconnu';

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Catalogue des Prestations</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} style={{ marginRight: '8px' }} /> Nouvelle Prestation
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3>Ajouter une prestation</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <input className="table-input" placeholder="Code (ex: DEV-REACT)" required onChange={e => setNewPrestation({...newPrestation, code: e.target.value})} />
            <input className="table-input" placeholder="Nom de la prestation" required onChange={e => setNewPrestation({...newPrestation, name: e.target.value})} />
            <select className="table-input" required onChange={e => setNewPrestation({...newPrestation, serviceId: e.target.value})}>
              <option value="">Sélectionner un service...</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input className="table-input" type="number" step="0.01" placeholder="Prix Unitaire (FCFA)" required onChange={e => setNewPrestation({...newPrestation, price: parseFloat(e.target.value)})} />
            <select className="table-input" value={newPrestation.unit} onChange={e => setNewPrestation({...newPrestation, unit: e.target.value})}>
              <option value="Jour">Jour</option>
              <option value="Heure">Heure</option>
              <option value="Forfait">Forfait</option>
              <option value="Unité">Unité</option>
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
              <th>Code</th>
              <th>Nom de la prestation</th>
              <th>Service associé</th>
              <th>Prix Unitaire (HT)</th>
              <th>Unité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prestations.map(p => (
              <tr key={p.id}>
                <td>{p.code}</td>
                <td>{p.name}</td>
                <td>{getServiceName(p.serviceId)}</td>
                <td>{p.price.toLocaleString('fr-FR')} FCFA</td>
                <td>{p.unit}</td>
                <td>
                  <button className="icon-button" style={{ color: 'var(--color-primary)' }}><Edit2 size={16} /></button>
                  <button
                    className="icon-button text-error"
                    onClick={() => confirm({
                      title: 'Supprimer la prestation',
                      message: `Voulez-vous vraiment supprimer la prestation "${p.name}" (${p.code}) ?`,
                      confirmLabel: 'Supprimer',
                      onConfirm: () => deletePrestation(p.id)
                    })}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {prestations.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Aucune prestation trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
