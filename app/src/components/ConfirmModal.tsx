import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import './ConfirmModal.css';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [modalOptions, setModalOptions] = useState<ConfirmOptions | null>(null);
  const [loading, setLoading] = useState(false);

  const confirm = (options: ConfirmOptions) => {
    setModalOptions(options);
  };

  const handleClose = () => {
    if (loading) return;
    setModalOptions(null);
  };

  const handleConfirm = async () => {
    if (!modalOptions) return;
    try {
      setLoading(true);
      await modalOptions.onConfirm();
    } catch (error) {
      console.error('Action confirmation failure:', error);
    } finally {
      setLoading(false);
      setModalOptions(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {modalOptions && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
          <div className="confirm-modal card">
            <button className="confirm-modal-close" onClick={handleClose} disabled={loading}>
              <X size={18} />
            </button>
            <div className="confirm-modal-header">
              <div className={`confirm-modal-icon variant-${modalOptions.variant || 'danger'}`}>
                {modalOptions.variant === 'warning' ? <AlertTriangle size={24} /> : <Trash2 size={24} />}
              </div>
              <div>
                <h3 className="confirm-modal-title">{modalOptions.title || 'Confirmation de suppression'}</h3>
              </div>
            </div>

            <div className="confirm-modal-body">
              <p>{modalOptions.message}</p>
            </div>

            <div className="confirm-modal-actions">
              <button className="btn btn-secondary" onClick={handleClose} disabled={loading}>
                {modalOptions.cancelLabel || 'Annuler'}
              </button>
              <button
                className={`btn ${modalOptions.variant === 'warning' ? 'btn-warning' : 'btn-primary'}`}
                style={{ backgroundColor: modalOptions.variant === 'warning' ? 'var(--color-warning)' : 'var(--color-error)' }}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? 'Traitement...' : modalOptions.confirmLabel || 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within a ConfirmProvider');
  return context;
};
