-- Create a new table for indicatifs
CREATE TABLE indicatifs (
  id SERIAL PRIMARY KEY,
  cahier_id INTEGER NOT NULL,
  indicatif TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cahier_id) REFERENCES cahiers_de_veille(id) ON DELETE CASCADE
);

-- Add an index to improve query performance
CREATE INDEX idx_indicatifs_cahier_id ON indicatifs(cahier_id);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_indicatifs_updated_at
BEFORE UPDATE ON indicatifs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

