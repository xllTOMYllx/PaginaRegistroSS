-- Migration: Add estudios column to personal table
-- Date: 2025-12-03
-- Description: Adds a new column to store the maximum education level of users

-- Add estudios column to personal table
ALTER TABLE public.personal 
ADD COLUMN IF NOT EXISTS estudios character varying(50);

-- Add a comment to the column
COMMENT ON COLUMN public.personal.estudios IS 'Máximo grado de estudios: Primaria, Secundaria, Preparatoria, Licenciatura, Maestría, Doctorado, prefiero no decirlo';
