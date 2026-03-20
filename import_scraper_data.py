#!/usr/bin/env python3
"""
Import Script: SQLite to Cloudflare D1
Imports data from the scraper's SQLite database to Cloudflare D1
"""

import sqlite3
import json
import sys
from pathlib import Path

def export_to_sql(source_db_path: str, output_file: str = 'import_data.sql'):
    """
    Export data from SQLite to SQL file format compatible with D1
    """
    if not Path(source_db_path).exists():
        print(f"❌ Database not found: {source_db_path}")
        sys.exit(1)
    
    conn = sqlite3.connect(source_db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get all residences
    cursor.execute("SELECT * FROM senior_residences WHERE is_active = 1")
    residences = cursor.fetchall()
    
    print(f"📊 Found {len(residences)} residences")
    
    # Generate SQL INSERT statements
    sql_lines = [
        "-- Imported data from scraper",
        "-- Run with: wrangler d1 execute senior-residences-eu --local --file=import_data.sql",
        ""
    ]
    
    for row in residences:
        # Build INSERT statement
        columns = list(row.keys())
        values = []
        
        for col in columns:
            value = row[col]
            if value is None:
                values.append('NULL')
            elif isinstance(value, (int, float)):
                values.append(str(value))
            elif isinstance(value, bool):
                values.append('1' if value else '0')
            else:
                # Escape single quotes
                escaped = str(value).replace("'", "''")
                values.append(f"'{escaped}'")
        
        insert_sql = f"INSERT OR REPLACE INTO senior_residences ({', '.join(columns)}) VALUES ({', '.join(values)});"
        sql_lines.append(insert_sql)
    
    # Update country statistics
    sql_lines.extend([
        "",
        "-- Update country statistics",
        "UPDATE countries SET total_residences = (",
        "    SELECT COUNT(*) FROM senior_residences WHERE country_code = countries.code AND is_active = 1",
        ");"
    ])
    
    # Write to file
    output_path = Path(output_file)
    output_path.write_text('\n'.join(sql_lines), encoding='utf-8')
    
    print(f"✅ Exported to {output_file}")
    print(f"📝 {len(residences)} residences exported")
    print(f"\nTo import into D1:")
    print(f"  wrangler d1 execute senior-residences-eu --local --file={output_file}")
    
    conn.close()


def export_to_json(source_db_path: str, output_file: str = 'import_data.json'):
    """
    Export data to JSON format for API-based import
    """
    if not Path(source_db_path).exists():
        print(f"❌ Database not found: {source_db_path}")
        sys.exit(1)
    
    conn = sqlite3.connect(source_db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM senior_residences WHERE is_active = 1")
    residences = [dict(row) for row in cursor.fetchall()]
    
    output_path = Path(output_file)
    output_path.write_text(json.dumps(residences, indent=2, ensure_ascii=False), encoding='utf-8')
    
    print(f"✅ Exported {len(residences)} residences to {output_file}")
    
    conn.close()


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Import scraper data to D1')
    parser.add_argument('source_db', help='Path to source SQLite database')
    parser.add_argument('--format', choices=['sql', 'json'], default='sql', help='Output format')
    parser.add_argument('--output', help='Output file path')
    
    args = parser.parse_args()
    
    if args.format == 'sql':
        output = args.output or 'import_data.sql'
        export_to_sql(args.source_db, output)
    else:
        output = args.output or 'import_data.json'
        export_to_json(args.source_db, output)
