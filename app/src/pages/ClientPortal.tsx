import { Download, Check, X, Send, MessageCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../components/ConfirmModal';
import './ClientPortal.css';

export function ClientPortal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quotes, clients, settings, updateQuoteStatus } = useAppContext();
  const { currentUser } = useAuth();
  const { confirm } = useConfirm();

  const quote = quotes.find(q => q.id === id);

  if (!quote) {
    return <div className="client-portal" style={{ padding: '40px', textAlign: 'center' }}><h2>Devis introuvable</h2></div>;
  }

  const client = clients.find(c => c.id === quote.clientId);

  const handleStatusChange = (status: 'Accepté' | 'Refusé' | 'Brouillon' | 'Envoyé') => {
    const isAccept = status === 'Accepté';
    confirm({
      title: isAccept ? 'Accepter le devis' : 'Refuser le devis',
      message: isAccept
        ? 'Confirmez-vous l\'acceptation de ce devis ? Cette décision sera transmise immédiatement au prestataire.'
        : 'Êtes-vous sûr de vouloir refuser ce devis ?',
      confirmLabel: isAccept ? 'Accepter le devis' : 'Refuser le devis',
      variant: isAccept ? 'success' : 'danger',
      onConfirm: async () => {
        await updateQuoteStatus(quote.id, status);
        if (currentUser && status !== 'Envoyé') navigate('/devis');
      }
    });
  };

  const handleSend = () => {
    updateQuoteStatus(quote.id, 'Envoyé');
    const portalUrl = `${window.location.origin}/portail-client/${quote.id}`;
    alert(`Devis envoyé au client avec succès par e-mail !\n\nLien du portail client :\n${portalUrl}`);
  };

  const handleSendWhatsapp = () => {
    if (!client || !client.phone) {
      alert("Ce client n'a pas de numéro de téléphone enregistré.");
      return;
    }
    updateQuoteStatus(quote.id, 'Envoyé');
    const link = `${window.location.origin}/portail-client/${quote.id}`;
    const message = `Bonjour ${client.contact || client.name},\n\nVoici le lien vers votre devis : ${link}\n\nMerci de votre confiance.`;
    
    let phoneStr = client.phone.replace(/[^0-9+]/g, '');
    if (!phoneStr.startsWith('+')) {
      phoneStr = '+225' + phoneStr;
    }
    
    const waLink = `https://wa.me/${phoneStr.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
  };

  return (
    <div 
      className={`client-portal style-${(quote.style || 'classique').toLowerCase()}`}
      style={quote.accentColor ? { '--color-primary': quote.accentColor } as React.CSSProperties : {}}
    >
      {/* Admin Toolbar - Only visible if an employee is logged in */}
      {currentUser && (
        <div className="admin-preview-toolbar">
          <div className="toolbar-left">
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.9rem' }} onClick={() => navigate('/devis')}>
              <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Retour aux devis
            </button>
            <span style={{ marginLeft: '16px', fontWeight: 'bold' }}>Mode Prévisualisation</span>
          </div>
          <div className="toolbar-right" style={{ display: 'flex', gap: '8px' }}>
            <button className="btn" style={{ backgroundColor: 'white', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', padding: '6px 12px', fontSize: '0.9rem' }} onClick={handleSend}>
              <Send size={14} style={{ marginRight: '6px' }} /> E-mail
            </button>
            <button className="btn" style={{ backgroundColor: '#25D366', color: 'white', padding: '6px 12px', fontSize: '0.9rem', border: 'none' }} onClick={handleSendWhatsapp}>
              <MessageCircle size={14} style={{ marginRight: '6px' }} /> WhatsApp
            </button>
          </div>
        </div>
      )}

      <header className="portal-header">
        <div className="portal-container header-content">
          <div className="brand-name">
            {settings.headerLogoBase64 ? (
              <img src={settings.headerLogoBase64} alt={settings.companyName} style={{ height: '40px', objectFit: 'contain' }} />
            ) : (
              settings.companyName
            )}
          </div>
          <button className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>
            <Download size={16} style={{ marginRight: '8px' }} />
            Télécharger PDF
          </button>
        </div>
      </header>

      <main className="portal-container portal-main">
        <div className="card devis-document">
          <div className="devis-header">
            <div className="company-info">
              {settings.headerLogoBase64 && (
                <img src={settings.headerLogoBase64} alt={settings.companyName} style={{ maxWidth: '200px', maxHeight: '80px', marginBottom: '16px', objectFit: 'contain' }} />
              )}
              {!settings.headerLogoBase64 && <h2>{settings.companyName}</h2>}
              <p>{settings.companyAddress}</p>
              <p>RCCM: {settings.companySiret}</p>
            </div>
            <div className="client-info">
              <h3>Devis N° {quote.quoteNumber}</h3>
              <p><strong>Pour :</strong> {client?.name || 'Client Inconnu'}</p>
              <p>{client?.contact}</p>
              <p>{client?.email}</p>
              <p>Date : {quote.date}</p>
            </div>
          </div>

          <div className="devis-body">
            <table className="devis-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qté</th>
                  <th>Prix Unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.lines.map((line) => (
                  <tr key={line.id}>
                    <td>
                      <strong>{line.description}</strong>
                    </td>
                    <td>{line.quantity}</td>
                    <td>{line.unitPrice.toLocaleString('fr-FR')} FCFA</td>
                    <td>{line.total.toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="devis-footer">
            <div className="conditions">
              <h4>Conditions Générales</h4>
              <p className="text-muted" style={{ fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                Ce devis est valable pour une durée de {settings.defaultValidity} jours.
                {'\n'}{settings.defaultTerms}
              </p>
            </div>
            <div className="totals">
              {quote.discountPercent && quote.discountPercent > 0 ? (
                <>
                  <div className="total-row">
                    <span>Remise ({quote.discountPercent}%)</span>
                    <span>-{quote.discountAmount?.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="total-row">
                    <span>Sous-total Net HT</span>
                    <span>{quote.subtotal.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </>
              ) : (
                <div className="total-row">
                  <span>Sous-total HT</span>
                  <span>{quote.subtotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              <div className="total-row">
                <span>TVA ({settings.defaultVat !== undefined ? settings.defaultVat : 20}%)</span>
                <span>{quote.vat.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="total-row grand-total">
                <span>Total TTC</span>
                <span>{quote.total.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>

          <div className="signature-section">
            <div className="signature-box">
              <p>Signature du prestataire</p>
              <div className="signature-placeholder">[Cachet HINOV]</div>
            </div>
            <div className="signature-box client-box">
              <p>Signature du client</p>
              {quote.status === 'Accepté' ? (
                <div className="signature-placeholder" style={{ color: 'var(--color-success)' }}>SIGNÉ</div>
              ) : (
                <div className="signature-input-area">
                  En attente de signature
                </div>
              )}
            </div>
          </div>
        </div>

        {quote.status !== 'Accepté' && quote.status !== 'Refusé' && (
          <div className="client-actions-section">
            <h3>Votre décision</h3>
            <div className="action-buttons">
              <button className="btn btn-success action-btn" onClick={() => handleStatusChange('Accepté')}>
                <Check size={20} style={{ marginRight: '8px' }} />
                Accepter le devis
              </button>
              <button className="btn btn-warning action-btn">
                <AlertCircle size={20} style={{ marginRight: '8px' }} />
                Demander une révision
              </button>
              <button className="btn btn-danger action-btn" onClick={() => handleStatusChange('Refusé')}>
                <X size={20} style={{ marginRight: '8px' }} />
                Refuser
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
