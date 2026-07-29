import { FileText, Briefcase, Clock, Percent } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './DashboardDirecteur.css'; 

export function DashboardResponsable() {
  const { quotes, prestations } = useAppContext();

  const totalQuotes = quotes.length;
  const toReviewQuotes = quotes.filter(q => q.status === 'Brouillon' || q.status === 'Envoyé').length;
  const acceptedQuotes = quotes.filter(q => q.status === 'Accepté').length;
  const acceptanceRate = totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0;
  const totalPrestations = prestations.length;

  return (
    <div className="dashboard">
      <h2>Tableau de bord - Responsable</h2>
      
      <div className="widgets-grid">
        <div className="widget-card">
          <div className="widget-icon bg-info">
            <FileText size={32} color="white" />
          </div>
          <div className="widget-content">
            <div className="widget-label">DEVIS DU SERVICE</div>
            <div className="widget-value">{totalQuotes}</div>
          </div>
        </div>
        
        <div className="widget-card">
          <div className="widget-icon bg-primary">
            <Briefcase size={32} color="white" />
          </div>
          <div className="widget-content">
            <div className="widget-label">PRESTATIONS</div>
            <div className="widget-value">{totalPrestations}</div>
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-icon bg-warning">
            <Clock size={32} color="white" />
          </div>
          <div className="widget-content">
            <div className="widget-label">DEVIS À VALIDER</div>
            <div className="widget-value">{toReviewQuotes}</div>
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-icon bg-success">
            <Percent size={32} color="white" />
          </div>
          <div className="widget-content">
            <div className="widget-label">TAUX D'ACCEPTATION</div>
            <div className="widget-value">{acceptanceRate}%</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Activité du service (Simulée)</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Responsable</th>
              <th>Devis Créés</th>
              <th>Devis Acceptés</th>
              <th>Valeur Totale</th>
              <th>Taux Conv.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>L'équipe Globale</td>
              <td>{totalQuotes}</td>
              <td>{acceptedQuotes}</td>
              <td>{quotes.reduce((sum, q) => sum + q.subtotal, 0).toLocaleString('fr-FR')} €</td>
              <td><span className="badge-status bg-success">{acceptanceRate}%</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
