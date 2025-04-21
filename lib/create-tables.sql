-- Create a function to create all necessary tables if they don't exist
CREATE OR REPLACE FUNCTION create_tables()
RETURNS void AS $$
BEGIN
  -- Create sources table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sources') THEN
    CREATE TABLE sources (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL UNIQUE,
      url VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE 'Created sources table';
  ELSE
    RAISE NOTICE 'Sources table already exists';
  END IF;
  
  -- Create research_runs table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'research_runs') THEN
    CREATE TABLE research_runs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      run_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      target_date DATE NOT NULL,
      model_used VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL,
      pick_count INTEGER DEFAULT 0,
      duration_ms INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE 'Created research_runs table';
  ELSE
    RAISE NOTICE 'Research_runs table already exists';
  END IF;
  
  -- Create consensus_picks table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'consensus_picks') THEN
    CREATE TABLE consensus_picks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      research_run_id UUID REFERENCES research_runs(id),
      pick_date DATE NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      matchup VARCHAR(255) NOT NULL,
      pick VARCHAR(255) NOT NULL,
      consensus_strength INTEGER NOT NULL,
      rationale TEXT NOT NULL,
      result VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE 'Created consensus_picks table';
  ELSE
    RAISE NOTICE 'Consensus_picks table already exists';
  END IF;
  
  -- Create pick_sources table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pick_sources') THEN
    CREATE TABLE pick_sources (
      pick_id UUID REFERENCES consensus_picks(id),
      source_id UUID REFERENCES sources(id),
      source_url VARCHAR(255) NOT NULL,
      PRIMARY KEY (pick_id, source_id)
    );
    
    RAISE NOTICE 'Created pick_sources table';
  ELSE
    RAISE NOTICE 'Pick_sources table already exists';
  END IF;
  
  -- Create view for consensus picks with sources
  EXECUTE 'DROP VIEW IF EXISTS consensus_picks_with_sources';
  
  CREATE VIEW consensus_picks_with_sources AS
  SELECT 
    cp.*,
    COALESCE(
      json_agg(
        json_build_object(
          'name', s.name,
          'url', ps.source_url
        )
      ) FILTER (WHERE s.id IS NOT NULL),
      '[]'::json
    ) as sources
  FROM 
    consensus_picks cp
  LEFT JOIN 
    pick_sources ps ON cp.id = ps.pick_id
  LEFT JOIN 
    sources s ON ps.source_id = s.id
  GROUP BY 
    cp.id;
    
  RAISE NOTICE 'Created consensus_picks_with_sources view';
  
  -- Ensure uuid-ossp extension is enabled
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  RAISE NOTICE 'Database tables setup complete';
END;
$$ LANGUAGE plpgsql;

-- Create a function specifically for creating the sources table
CREATE OR REPLACE FUNCTION create_sources_table()
RETURNS void AS $$
BEGIN
  -- Create sources table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sources') THEN
    CREATE TABLE sources (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL UNIQUE,
      url VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Ensure uuid-ossp extension is enabled
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    RAISE NOTICE 'Created sources table';
  ELSE
    RAISE NOTICE 'Sources table already exists';
  END IF;
END;
$$ LANGUAGE plpgsql;
