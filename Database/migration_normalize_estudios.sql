-- Migration: Normalize estudios column to UPPERCASE
-- Date: 2025-12-03
-- Description: Updates all existing estudios values to UPPERCASE for consistency

-- Update all existing estudios values to UPPERCASE
UPDATE public.personal 
SET estudios = UPPER(estudios)
WHERE estudios IS NOT NULL AND estudios != UPPER(estudios);

-- Show count of updated records
SELECT COUNT(*) as updated_records
FROM public.personal
WHERE estudios IS NOT NULL;

-- Display current estudios distribution
SELECT estudios, COUNT(*) as count
FROM public.personal
WHERE estudios IS NOT NULL
GROUP BY estudios
ORDER BY count DESC;
