# Database Migration Instructions

## Adding the `estudios` Column

To add support for the new education level field in the registration form and advanced search, you need to run the migration SQL file.

### Steps:

1. Connect to your PostgreSQL database
2. Run the migration file:

```bash
psql -U postgres -d your_database_name -f Database/migration_add_estudios.sql
```

Or using a PostgreSQL client like pgAdmin:
- Open the file `Database/migration_add_estudios.sql`
- Execute the SQL statements in your database

### What the migration does:

- Adds a new column `estudios` to the `personal` table
- The column is of type `character varying(50)`
- It stores the maximum education level: Primaria, Secundaria, Preparatoria, Licenciatura, Maestría, Doctorado, or "prefiero no decirlo"
- The column is nullable (existing records will have NULL values)

### Verification:

After running the migration, verify it was successful by running:

```sql
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'personal' AND column_name = 'estudios';
```

You should see one row with:
- column_name: estudios
- data_type: character varying
- character_maximum_length: 50
- is_nullable: YES

### Note:

If you want to update the main schema file (`esquema.sql`), you'll need to:
1. Add the line `estudios character varying(50),` after the `rfc` column in the `CREATE TABLE public.personal` statement
2. The file is in UTF-16LE encoding, so use an appropriate editor or tool to modify it
