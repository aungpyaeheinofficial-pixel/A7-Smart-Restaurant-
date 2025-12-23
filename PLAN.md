
# A7 Restaurant OS - Implementation Plan

## 1. Architectural Overview
A7 OS is designed as a Single Page Application (SPA) using React 18, focusing on real-time feedback and high accessibility for high-stress restaurant environments.

### Core Tech Stack
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS (Utility-first)
- **Icons**: Lucide React
- **Charts**: Recharts (Customized for A7 Branding)
- **State Management**: React Context + In-memory Store (Mock Backend)

## 2. Data Flow & State Shape
The application uses a `Providers.tsx` layer to manage domain states:
- `menu`: Categories and items.
- `orders`: Active and historical order objects.
- `tables`: Physical floor plan layout and occupancy status.
- `staff`: Clocked-in status and roles.
- `inventory`: Ingredient counts and thresholds.

### Data Model Synchronization
The `api/services.ts` simulates network requests with a `LATENCY` constant. This allows us to implement "Optimistic UI" patterns where appropriate, though the current MVP relies on a robust `refreshAll` polling mechanism to keep the KDS and Floor Plan in sync across different terminal simulated views.

## 3. Module Hierarchy
1. **Dashboard**: High-level KPI visualization and trend analysis.
2. **POS**: The primary transaction interface. Built with a 3-column touch-optimized layout.
3. **Table Mgmt**: Visual representation of the restaurant floor. Essential for front-of-house coordination.
4. **KDS**: Production Kanban. Organizes flow from Order Creation -> Preparation -> Fulfillment.
5. **Secondary Modules**: Inventory, Staff, and Menu Mgmt are implemented with feature-rich placeholders/tables to demonstrate the UX pattern.

## 4. Key Trade-offs & Decisions
- **Polling vs WebSockets**: For this MVP, we use 5s interval polling to simulate real-time updates without needing a persistent socket server.
- **HashRouter**: Chosen to ensure compatibility with file-system-based routing environments and prevent 404s on refresh in static hosting.
- **In-Memory Store**: Data resets on refresh. A TODO for production would be integrating a persistent database like PostgreSQL or Firebase.

## 5. Design System (A7 Tokens)
- Primary Accent: #E63946 (Red) - Used for critical actions and branding.
- Surface: #FFFFFF - All functional cards use white backgrounds to maintain high contrast.
- Radius: Large (16px) - Softens the industrial feel of a utility OS.
