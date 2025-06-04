-- Add archived column to cahiers_de_veille table
ALTER TABLE cahiers_de_veille ADD COLUMN archived BOOLEAN DEFAULT FALSE;

-- Create an index on the archived column for better query performance
CREATE INDEX idx_cahiers_de_veille_archived ON cahiers_de_veille(archived);
