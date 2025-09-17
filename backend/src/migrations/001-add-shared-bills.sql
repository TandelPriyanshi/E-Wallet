-- Add category column to bills table
ALTER TABLE bill ADD COLUMN IF NOT EXISTS category VARCHAR(255);

-- Create shared_bills table
CREATE TABLE IF NOT EXISTS shared_bills (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER NOT NULL REFERENCES bill(id) ON DELETE CASCADE,
    owner_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    shared_with_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    permission_level VARCHAR(20) DEFAULT 'view',
    is_active BOOLEAN DEFAULT true,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique constraint on bill_id and shared_with_id to prevent duplicate sharing
    UNIQUE(bill_id, shared_with_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shared_bills_owner_id ON shared_bills(owner_id);
CREATE INDEX IF NOT EXISTS idx_shared_bills_shared_with_id ON shared_bills(shared_with_id);
CREATE INDEX IF NOT EXISTS idx_shared_bills_bill_id ON shared_bills(bill_id);
CREATE INDEX IF NOT EXISTS idx_shared_bills_is_active ON shared_bills(is_active);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shared_bills_updated_at BEFORE UPDATE ON shared_bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
