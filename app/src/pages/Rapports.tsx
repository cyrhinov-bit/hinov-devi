import React from 'react';
import { Download } from 'lucide-react';

export function Rapports() {
  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Rapports & Statistiques</h2>
        <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center' }}>
          <Download size={16} style={{ marginRight: '8px' }} /> Exporter PDF
        </button>
      </div>

      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <h3>Chiffre d'affaires mensuel</h3>
          <div className="chart-placeholder" style={{ height: '300px' }}>
            [Graphique en ligne - Évolution du CA]
          </div>
        </div>
        <div className="card">
          <h3>Top Clients (Valeur générée)</h3>
          <div className="chart-placeholder" style={{ height: '300px' }}>
            [Graphique à barres horizontales - Top Clients]
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3>Performance des commerciaux</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Commercial</th>
              <th>Devis émis</th>
              <th>Acceptés</th>
              <th>Taux Conv.</th>
              <th>CA Généré (HT)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Alice Dupont</td>
              <td>124</td>
              <td>82</td>
              <td><span className="badge-status bg-success">66%</span></td>
              <td>425 000 €</td>
            </tr>
            <tr>
              <td>Marc Leroy</td>
              <td>85</td>
              <td>35</td>
              <td><span className="badge-status bg-warning">41%</span></td>
              <td>215 000 €</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
