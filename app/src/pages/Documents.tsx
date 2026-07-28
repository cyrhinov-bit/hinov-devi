import React from 'react';
import { Upload, FileText, Download, Trash2 } from 'lucide-react';

export function Documents() {
  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Gestion Documentaire</h2>
        <button className="btn btn-primary">
          <Upload size={16} style={{ marginRight: '8px' }} /> Uploader un document
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom du fichier</th>
              <th>Type</th>
              <th>Date d'ajout</th>
              <th>Taille</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><FileText size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> CGV_2026.pdf</td>
              <td>Conditions Générales</td>
              <td>01/01/2026</td>
              <td>124 KB</td>
              <td>
                <button className="icon-button" style={{ color: 'var(--color-primary)' }}><Download size={16} /></button>
                <button className="icon-button text-error"><Trash2 size={16} /></button>
              </td>
            </tr>
            <tr>
              <td><FileText size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Modele_Contrat_Prestation.docx</td>
              <td>Modèle Documentaire</td>
              <td>15/03/2026</td>
              <td>2.1 MB</td>
              <td>
                <button className="icon-button" style={{ color: 'var(--color-primary)' }}><Download size={16} /></button>
                <button className="icon-button text-error"><Trash2 size={16} /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
