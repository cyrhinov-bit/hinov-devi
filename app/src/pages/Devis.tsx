import { useState } from 'react';
import { Plus, FileText, Download, Send, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { generateWhatsAppLink } from '../lib/sendUtils';
import { SendModal } from '../components/SendModal';
import type { Quote } from '../context/AppContext';

export function Devis() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { quotes, clients, settings, updateQuoteStatus, prestations } = useAppContext();
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeSendQuote, setActiveSendQuote] = useState<Quote | null>(null);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Inconnu';

  const allowedQuotes = currentUser?.role === 'Directeur'
    ? quotes
    : quotes.filter(q => q.lines.some(l => {
        const p = prestations.find(prest => prest.id === l.prestationId);
        return p?.serviceId === currentUser?.serviceId;
      }));

  const filteredQuotes = allowedQuotes.filter(q => {
    const matchClient = getClientName(q.clientId).toLowerCase().includes(filter.toLowerCase()) || q.quoteNumber.toLowerCase().includes(filter.toLowerCase());
    const matchStatus = statusFilter ? q.status.toLowerCase() === statusFilter.toLowerCase() : true;
    return matchClient && matchStatus;
  });

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'Accepté': return 'bg-success';
      case 'Refusé': return 'bg-error';
      case 'Envoyé': return 'bg-primary';
      case 'Brouillon': return 'bg-secondary';
      default: return '';
    }
  };

  const handleSend = (q: Quote) => {
    setActiveSendQuote(q);
  };

  const handleSendWhatsapp = (q: Quote) => {
    const client = clients.find(c => c.id === q.clientId);
    const { link, error } = generateWhatsAppLink(q, client, settings);
    if (error) {
      alert(error);
      return;
    }
    updateQuoteStatus(q.id, 'Envoyé');
    window.open(link, '_blank');
  };

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Tous les devis</h2>
        <button className="btn btn-primary" onClick={() => navigate('/devis/nouveau')}>
          <Plus size={16} style={{ marginRight: '8px' }} /> Créer un devis
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <input 
            type="text" 
            className="table-input" 
            placeholder="Rechercher par client ou numéro..." 
            style={{ maxWidth: '300px' }} 
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          <select 
            className="table-input" 
            style={{ maxWidth: '200px' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="Brouillon">Brouillon</option>
            <option value="Envoyé">Envoyé</option>
            <option value="Accepté">Accepté</option>
            <option value="Refusé">Refusé</option>
          </select>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>N° Devis</th>
              <th>Client</th>
              <th>Sujet</th>
              <th>Montant HT</th>
              <th>Statut</th>
              <th>Date d'émission</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.map(q => (
              <tr key={q.id}>
                <td>{q.quoteNumber}</td>
                <td>{getClientName(q.clientId)}</td>
                <td>{q.subject}</td>
                <td>{q.subtotal.toLocaleString('fr-FR')} FCFA</td>
                <td><span className={`badge-status ${getBadgeColor(q.status)}`}>{q.status}</span></td>
                <td>{q.date}</td>
                <td>
                  <button className="icon-button" style={{ color: 'var(--color-primary)' }} onClick={() => handleSend(q)} title="Envoyer par E-mail">
                    <Send size={18} />
                  </button>
                  <button className="icon-button" style={{ color: '#25D366' }} onClick={() => handleSendWhatsapp(q)} title="Envoyer par WhatsApp">
                    <MessageCircle size={18} />
                  </button>
                  <button className="icon-button" style={{ color: 'var(--color-primary)' }} onClick={() => navigate(`/portail-client/${q.id}`)} title="Voir le portail">
                    <FileText size={18} />
                  </button>
                  <button className="icon-button" style={{ color: 'var(--color-primary)' }} title="Télécharger">
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredQuotes.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>Aucun devis trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {activeSendQuote && (
        <SendModal
          quote={activeSendQuote}
          client={clients.find(c => c.id === activeSendQuote.clientId)}
          settings={settings}
          isOpen={!!activeSendQuote}
          onClose={() => setActiveSendQuote(null)}
          onSent={() => {
            updateQuoteStatus(activeSendQuote.id, 'Envoyé');
            setActiveSendQuote(null);
          }}
        />
      )}
    </div>
  );
}
