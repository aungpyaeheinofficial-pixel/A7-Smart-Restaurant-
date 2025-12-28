-- Initial schema for A7 Restaurant OS (Postgres)

CREATE TYPE "StaffRole" AS ENUM ('Manager', 'Server', 'Kitchen', 'Cashier');
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'preparing', 'ready', 'served', 'paid');
CREATE TYPE "OrderType" AS ENUM ('dine_in', 'takeout', 'delivery');
CREATE TYPE "TableStatus" AS ENUM ('vacant', 'seated', 'served', 'cleaning');
CREATE TYPE "InventoryStatus" AS ENUM ('In_Stock', 'Low_Stock', 'Out_of_Stock');

CREATE TABLE "Restaurant" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "timezone" TEXT NOT NULL,
  "currency" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "SystemSettings" (
  "id" TEXT PRIMARY KEY,
  "restaurantId" TEXT NOT NULL UNIQUE REFERENCES "Restaurant"("id") ON DELETE CASCADE,
  "taxRate" NUMERIC(6,3) NOT NULL,
  "currencySymbol" TEXT NOT NULL,
  "autoClockOut" BOOLEAN NOT NULL DEFAULT TRUE,
  "pinLength" INTEGER NOT NULL DEFAULT 4,
  "primaryColor" TEXT NOT NULL,
  "enableKitchenAudio" BOOLEAN NOT NULL DEFAULT TRUE,
  "kdsRefreshRate" INTEGER NOT NULL DEFAULT 5,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "Category" (
  "id" TEXT PRIMARY KEY,
  "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "icon" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Category_restaurant_name_unique" UNIQUE ("restaurantId", "name")
);
CREATE INDEX "Category_restaurantId_idx" ON "Category"("restaurantId");

CREATE TABLE "MenuItem" (
  "id" TEXT PRIMARY KEY,
  "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
  "categoryId" TEXT NOT NULL REFERENCES "Category"("id") ON DELETE RESTRICT,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "prices" JSONB NOT NULL,
  "cost" NUMERIC(10,2),
  "image" TEXT,
  "taxRate" NUMERIC(6,3) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "is86d" BOOLEAN NOT NULL DEFAULT FALSE,
  "recipe" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "MenuItem_restaurantId_idx" ON "MenuItem"("restaurantId");
CREATE INDEX "MenuItem_categoryId_idx" ON "MenuItem"("categoryId");

CREATE TABLE "StaffMember" (
  "id" TEXT PRIMARY KEY,
  "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "role" "StaffRole" NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT FALSE,
  "avatar" TEXT NOT NULL,
  "lastClockIn" TIMESTAMPTZ,
  "email" TEXT UNIQUE,
  "passwordHash" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "StaffMember_restaurantId_idx" ON "StaffMember"("restaurantId");

CREATE TABLE "Table" (
  "id" TEXT PRIMARY KEY,
  "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
  "label" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL,
  "status" "TableStatus" NOT NULL DEFAULT 'vacant',
  "serverId" TEXT REFERENCES "StaffMember"("id") ON DELETE SET NULL,
  "currentOrderId" TEXT,
  "x" INTEGER,
  "y" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Table_restaurant_label_unique" UNIQUE ("restaurantId", "label")
);
CREATE INDEX "Table_restaurantId_idx" ON "Table"("restaurantId");

CREATE TABLE "InventoryItem" (
  "id" TEXT PRIMARY KEY,
  "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "onHand" NUMERIC(12,3) NOT NULL,
  "parLevel" NUMERIC(12,3) NOT NULL,
  "unit" TEXT NOT NULL,
  "unitCost" NUMERIC(10,2) NOT NULL,
  "status" "InventoryStatus" NOT NULL DEFAULT 'In_Stock',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "InventoryItem_restaurant_sku_unique" UNIQUE ("restaurantId", "sku")
);
CREATE INDEX "InventoryItem_restaurantId_idx" ON "InventoryItem"("restaurantId");

CREATE TABLE "Order" (
  "id" TEXT PRIMARY KEY,
  "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
  "orderNumber" TEXT NOT NULL,
  "type" "OrderType" NOT NULL,
  "tableId" TEXT REFERENCES "Table"("id") ON DELETE SET NULL,
  "status" "OrderStatus" NOT NULL,
  "subtotal" NUMERIC(12,2) NOT NULL,
  "tax" NUMERIC(12,2) NOT NULL,
  "tip" NUMERIC(12,2) NOT NULL,
  "total" NUMERIC(12,2) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Order_restaurant_orderNumber_unique" UNIQUE ("restaurantId", "orderNumber")
);
CREATE INDEX "Order_restaurantId_idx" ON "Order"("restaurantId");

-- Add Table.currentOrderId -> Order.id relation after Order exists
ALTER TABLE "Table"
  ADD CONSTRAINT "Table_currentOrderId_fkey"
  FOREIGN KEY ("currentOrderId") REFERENCES "Order"("id") ON DELETE SET NULL;

CREATE TABLE "OrderItem" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "menuItemId" TEXT NOT NULL REFERENCES "MenuItem"("id") ON DELETE RESTRICT,
  "name" TEXT NOT NULL,
  "qty" INTEGER NOT NULL,
  "unitPrice" NUMERIC(12,2) NOT NULL,
  "modifiers" JSONB,
  "notes" TEXT
);
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_menuItemId_idx" ON "OrderItem"("menuItemId");

-- updatedAt triggers (simple)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_restaurant
BEFORE UPDATE ON "Restaurant"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_settings
BEFORE UPDATE ON "SystemSettings"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_category
BEFORE UPDATE ON "Category"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_menuitem
BEFORE UPDATE ON "MenuItem"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_staff
BEFORE UPDATE ON "StaffMember"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_table
BEFORE UPDATE ON "Table"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_inventory
BEFORE UPDATE ON "InventoryItem"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


