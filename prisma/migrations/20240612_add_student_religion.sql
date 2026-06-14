-- Add religion field to StudentProfile
ALTER TABLE "StudentProfile" ADD COLUMN "religion" TEXT;

-- Remove isReligion from Course (if it exists)
-- Note: This depends on your actual table names
-- ALTER TABLE "Course" DROP COLUMN IF EXISTS "isReligion";

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "StudentProfile_religion_idx" ON "StudentProfile"("religion");

-- Update existing records to have a default religion (optional)
-- UPDATE "StudentProfile" SET "religion" = 'Not Specified' WHERE "religion" IS NULL;
