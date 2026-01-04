-- Add section field to Table model
ALTER TABLE "Table" ADD COLUMN "section" TEXT;

-- Create index on restaurantId and section for faster queries
CREATE INDEX "Table_restaurantId_section_idx" ON "Table"("restaurantId", "section");

