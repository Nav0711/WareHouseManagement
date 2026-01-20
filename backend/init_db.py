#!/usr/bin/env python3
"""
Database initialization script
Runs schema.sql against the database
"""
import asyncio
import asyncpg
from app.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def initialize_database():
    """Initialize database schema"""
    
    # Read schema and sample data files
    with open('sql/schema.sql', 'r') as f:
        schema_sql = f.read()
    
    with open('sql/sample_data.sql', 'r') as f:
        sample_data_sql = f.read()
    
    # Connect to database
    try:
        conn = await asyncpg.connect(settings.DATABASE_URL)
        logger.info("Connected to database")
        
        # Execute schema
        logger.info("Creating tables...")
        await conn.execute(schema_sql)
        logger.info("✓ Tables created successfully")
        
        # Execute sample data
        logger.info("Inserting sample data...")
        await conn.execute(sample_data_sql)
        logger.info("✓ Sample data inserted successfully")
        
        # Verify
        count = await conn.fetchval("SELECT COUNT(*) FROM warehouses")
        logger.info(f"✓ Database initialized with {count} warehouses")
        
        await conn.close()
        logger.info("Database initialization completed successfully!")
        
    except asyncpg.exceptions.PostgresError as e:
        logger.error(f"Database error: {e}")
        raise
    except Exception as e:
        logger.error(f"Error: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(initialize_database())
