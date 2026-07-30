-- Ajouter le champ commentaire et modifier la contrainte de statut
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_comment TEXT;

ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_status_check;
ALTER TABLE quotes ADD CONSTRAINT quotes_status_check CHECK (status IN ('Brouillon', 'Envoyé', 'Accepté', 'Refusé', 'Révision'));
