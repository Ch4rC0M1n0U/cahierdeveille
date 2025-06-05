-- Create cahiers_de_veille table
CREATE TABLE cahiers_de_veille (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  evenement TEXT,
  redacteur TEXT,
  poste TEXT,
  frequence TEXT,
  responsable TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE cahiers_de_veille ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own cahiers" ON cahiers_de_veille
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cahiers" ON cahiers_de_veille
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cahiers" ON cahiers_de_veille
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cahiers" ON cahiers_de_veille
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_cahiers_de_veille_user_id ON cahiers_de_veille(user_id);
CREATE INDEX idx_cahiers_de_veille_archived ON cahiers_de_veille(archived);
CREATE INDEX idx_cahiers_de_veille_created_at ON cahiers_de_veille(created_at);

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_cahiers_de_veille_updated_at
BEFORE UPDATE ON cahiers_de_veille
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
