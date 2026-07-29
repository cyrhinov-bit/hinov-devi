import { useState } from 'react';
import { Plus, Save, FileText, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import type { QuoteLine } from '../context/AppContext';
import './QuoteCreation.css';

export function QuoteCreation() {
  const navigate = useNavigate();
  const { clients, prestations, addQuote } = useAppContext();
  const { currentUser } = useAuth();

  const [clientId, setClientId] = useState('');
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState<'Classique' | 'Moderne' | 'Minimaliste'>('Classique');
  const [accentColor, setAccentColor] = useState('#009688');
  const [lines, setLines] = useState<Omit<QuoteLine, 'id'>[]>([]);

  const handleAddLine = () => {
    setLines([...lines, { prestationId: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof QuoteLine, value: any) => {
    const newLines = [...lines];
    const line = { ...newLines[index] };
    
    // @ts-ignore
    line[field] = value;

    if (field === 'prestationId') {
      const prestation = availablePrestations.find(p => p.id === value);
      if (prestation) {
        line.description = prestation.name;
        line.unitPrice = prestation.price;
      }
    }

    line.total = line.quantity * line.unitPrice;
    newLines[index] = line;
    setLines(newLines);
  };

  const availablePrestations = currentUser?.role === 'Directeur'
    ? prestations
    : prestations.filter(p => p.serviceId === currentUser?.serviceId);

  const subtotal = lines.reduce((acc, line) => acc + line.total, 0);
  const vat = subtotal * 0.20;
  const total = subtotal + vat;

  const handleSave = (status: 'Brouillon' | 'Envoyé', preview: boolean = false) => {
    if (!clientId) {
      alert("Veuillez sélectionner un client");
      return;
    }

    const newId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    const now = new Date();
    const seq = (now.getTime() % 10000).toString().padStart(4, '0');
    const newQuote = {
      id: newId,
      quoteNumber: `DV-${now.getFullYear()}-${seq}`,
      clientId,
      commercialId: currentUser?.id || '',
      subject,
      lines: lines.map((l) => ({ ...l, id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() })),
      subtotal,
      vat,
      total,
      status,
      date: now.toISOString().split('T')[0],
      style,
      accentColor
    };

    addQuote(newQuote);

    if (preview) {
      navigate(`/portail-client/${newId}`);
    } else {
      navigate('/devis');
    }
  };

  return (
    <div className="quote-creation">
      <div className="page-header">
        <h2>Créer un nouveau devis</h2>
      </div>

      <div className="card form-card">
        <section className="form-section">
          <h3>Informations Générales</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Client</label>
              <select className="form-control" value={clientId} onChange={e => setClientId(e.target.value)}>
                <option value="">Sélectionner un client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Objet du devis</label>
              <input type="text" className="form-control" placeholder="Ex: Refonte site web" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h3>Prestations</h3>
          <table className="prestations-table">
            <thead>
              <tr>
                <th>Service (Catalogue)</th>
                <th>Description</th>
                <th style={{ width: '100px' }}>Qté</th>
                <th style={{ width: '150px' }}>Prix Unitaire</th>
                <th style={{ width: '150px' }}>Total</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx}>
                  <td>
                    <select className="table-input" value={line.prestationId} onChange={e => updateLine(idx, 'prestationId', e.target.value)}>
                      <option value="">Choisir...</option>
                      {availablePrestations.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
                    </select>
                  </td>
                  <td>
                    <input type="text" className="table-input" value={line.description} onChange={e => updateLine(idx, 'description', e.target.value)} />
                  </td>
                  <td>
                    <input type="number" className="table-input" value={line.quantity} min="1" onChange={e => updateLine(idx, 'quantity', Number(e.target.value))} />
                  </td>
                  <td>
                    <input type="number" className="table-input" value={line.unitPrice} step="0.01" onChange={e => updateLine(idx, 'unitPrice', Number(e.target.value))} />
                  </td>
                  <td>{line.total.toFixed(2)} €</td>
                  <td>
                    <button className="icon-button text-error" onClick={() => handleRemoveLine(idx)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {lines.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '16px', color: 'var(--color-text-muted)' }}>Aucune ligne. Cliquez sur "Ajouter une ligne" pour commencer.</td>
                </tr>
              )}
            </tbody>
          </table>
          <button className="btn btn-outline" style={{ marginTop: '16px' }} onClick={handleAddLine}>
            <Plus size={16} style={{ marginRight: '8px' }} /> Ajouter une ligne
          </button>
        </section>

        <section className="form-section">
          <h3>Paramètres de design</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Style du devis (Portail Client)</label>
              <select className="form-control" value={style} onChange={e => setStyle(e.target.value as any)}>
                <option value="Classique">Classique (Standard)</option>
                <option value="Moderne">Moderne (Épuré et coloré)</option>
                <option value="Minimaliste">Minimaliste (Noir & Blanc)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Couleur principale du devis</label>
              <input type="color" className="form-control" style={{ height: '42px', cursor: 'pointer' }} value={accentColor} onChange={e => setAccentColor(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Signature & Cachet</label>
              <select className="form-control">
                <option>Signature par défaut + Cachet de l'entreprise</option>
              </select>
            </div>
          </div>
        </section>

        <div className="totals-section">
          <div className="total-row">
            <span>Sous-total HT</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>
          <div className="total-row">
            <span>TVA (20%)</span>
            <span>{vat.toFixed(2)} €</span>
          </div>
          <div className="total-row grand-total">
            <span>Total TTC</span>
            <span>{total.toFixed(2)} €</span>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={() => handleSave('Brouillon')}>
            <Save size={16} style={{ marginRight: '8px' }} /> Sauvegarder (Brouillon)
          </button>
          <button className="btn btn-primary" onClick={() => handleSave('Brouillon', true)}>
            <FileText size={16} style={{ marginRight: '8px' }} /> Générer & Prévisualiser
          </button>
        </div>
      </div>
    </div>
  );
}
