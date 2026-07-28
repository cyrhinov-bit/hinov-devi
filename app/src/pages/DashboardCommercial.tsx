import { FileText, Edit3, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './DashboardDirecteur.css'; 

export function DashboardCommercial() {
  const navigate = useNavigate();
  const { quotes, clients } = useAppContext();
  
  // Dans un cas réel, filtrer par commercial connecté
  const myQuotes = quotes; 
  
  const totalQuotes = myQuotes.length;
  const draftQuotes = myQuotes.filter(q => q.status === 'Brouillon').length;
  const sentQuotes = myQuotes.filter(q => q.status === 'Envoyé').length;
  const acceptedQuotes = myQuotes.filter(q => q.status === 'Accepté').length;

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Inconnu';
  
  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'Accepté': return 'bg-success';
      case 'Refusé': return 'bg-error';
      case 'Envoyé': return 'bg-primary';
      case 'Brouillon': return 'bg-secondary';
      default: return '';
    }
  };

  const recentQuotes = [...myQuotes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="dashboard">
      <h2>Tableau de bord - Commercial</h2>
      
      <div className="widgets-grid">
        <div className="widget-card">
          <div className="widget-icon bg-info">
            <FileText size={32} color="white" />
          </div>
          <div className="widget-content">
            <div className="widget-label">MES DEVIS (TOTAL)</div>
            <div className="widget-value">{totalQuotes}</div>
          </div>
        </div>
        
        <div className="widget-card">
          <div style={{ backgroundColor: '#9E9E9E' }} className="widget-icon">
            <Edit3 size={32} color="white" />
          </div>
          <div className="widget-content">
            <div className="widget-label">BROUILLONS</div>
            <div className="widget-value">{draftQuotes}</div>
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-icon bg-primary">
            <Send size={32} color="white" />
          </div>
          <div className="widget-content">
            <div className="widget-label">ENVOYÉS</div>
            <div className="widget-value">{sentQuotes}</div>
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-icon bg-success">
            <CheckCircle size={32} color="white" />
          </div>
          <div className="widget-content">
            <div className="widget-label">ACCEPTÉS</div>
            <div className="widget-value">{acceptedQuotes}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Mes Devis Récents</h3>
          <button 
            onClick={() => navigate('/devis/nouveau')}
            style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold' }}>
            + NOUVEAU DEVIS
          </button>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>N° Devis</th>
              <th>Client</th>
              <th>Montant HT</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentQuotes.map(q => (
              <tr key={q.id}>
                <td>{q.quoteNumber}</td>
                <td>{getClientName(q.clientId)}</td>
                <td>{q.subtotal.toFixed(2)} €</td>
                <td><span className={`badge-status ${getBadgeColor(q.status)}`}>{q.status}</span></td>
                <td>
                  <button className="icon-button" style={{ color: 'var(--color-primary)' }} onClick={() => navigate(`/portail-client/${q.id}`)}>
                    <FileText size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {recentQuotes.length === 0 && (
              <tr><td colSpan={5} style={{textAlign: 'center', padding: '16px'}}>Aucun devis.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
