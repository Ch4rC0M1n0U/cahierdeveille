-- Create communications table
CREATE TABLE communications (
  id SERIAL PRIMARY KEY,
  cahier_id INTEGER REFERENCES cahiers_de_veille(id) ON DELETE CASCADE,
  appele TEXT,
  appelant TEXT,
  heure TEXT,
  communication TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view communications of own cahiers" ON communications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cahiers_de_veille 
      WHERE cahiers_de_veille.id = communications.cahier_id 
      AND cahiers_de_veille.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert communications to own cahiers" ON communications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cahiers_de_veille 
      WHERE cahiers_de_veille.id = communications.cahier_id 
      AND cahiers_de_veille.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update communications of own cahiers" ON communications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cahiers_de_veille 
      WHERE cahiers_de_veille.id = communications.cahier_id 
      AND cahiers_de_veille.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete communications of own cahiers" ON communications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM cahiers_de_veille 
      WHERE cahiers_de_veille.id = communications.cahier_id 
      AND cahiers_de_veille.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_communications_cahier_id ON communications(cahier_id);
CREATE INDEX idx_communications_heure ON communications(heure);

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_communications_updated_at
BEFORE UPDATE ON communications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
