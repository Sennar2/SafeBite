# Multi-Tenant and RBAC Architecture Design for Easy Bites

This document outlines the proposed architectural changes to transform the Easy Bites application into a secure, multi-tenant system using a **Shared Database, Shared Schema** model, leveraging Supabase's PostgreSQL and Row-Level Security (RLS) features.

## 1. Multi-Tenancy Implementation: Data Segregation

The core of multi-tenancy will be achieved by introducing a `companies` table and linking all relevant data tables to it via a `company_id` foreign key.

### 1.1. New `companies` Table

This table will serve as the tenant definition.

| Column | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY` | Unique identifier for the company (tenant). |
| `name` | `text` | `NOT NULL` | The legal name of the company. |
| `created_at` | `timestampz` | `DEFAULT now()` | Timestamp of company creation. |
| `is_active` | `boolean` | `DEFAULT true` | Flag to enable/disable the tenant. |

### 1.2. Schema Modifications (Assumed Existing Tables)

The following tables will be modified to include the `company_id` column.

| Table | New Column | Type | Constraint | Description |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `company_id` | `uuid` | `FOREIGN KEY (companies.id)` | Links a user to their company. |
| `locations` | `company_id` | `uuid` | `FOREIGN KEY (companies.id)` | Links a location to its company. |
| `checklists` | `company_id` | `uuid` | `FOREIGN KEY (companies.id)` | Links a checklist template to its company. |
| `fridges` | `company_id` | `uuid` | `FOREIGN KEY (companies.id)` | Links a fridge/asset to its company. |
| `temp_records` | `company_id` | `uuid` | `FOREIGN KEY (companies.id)` | Links a temperature record to its company. |
| *All other data tables* | `company_id` | `uuid` | `FOREIGN KEY (companies.id)` | Ensures all data is scoped to a tenant. |

## 2. Role-Based Access Control (RBAC) Implementation

The user's role will be stored directly on the `users` table, and permissions will be enforced via RLS policies and application logic.

### 2.1. `users` Table Modification

A new column will be added to the `users` table (or a separate `user_profiles` table if preferred).

| Column | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `role` | `text` | `NOT NULL` | Stores the user's role: `super_user`, `company_admin`, `ops`, `manager`. |
| `location_id` | `uuid` | `FOREIGN KEY (locations.id)` | For `manager` role, restricts access to specific location(s). Can be an array of IDs for multiple locations. |

### 2.2. Role Definitions and Permissions Matrix

The following matrix defines the access scope and permissions for each role.

| Role | `role` Value | Data Scope | Master Data (Create/Edit) | Record Data (CRUD) | Record Download |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **App Super User** | `super_user` | All Companies, All Locations | Yes | Yes | All |
| **Company Admin** | `company_admin` | All Locations within their Company | Yes | Yes | All Company |
| **Ops** | `ops` | All Locations within their Company | No | Yes | All Company |
| **Manager/General User** | `manager` | Specific Location(s) within their Company | No | Yes | Specific Location |

## 3. Row-Level Security (RLS) Policies

RLS is crucial for enforcing data segregation. The policies will be based on the authenticated user's `company_id` and `role`.

### 3.1. RLS Policy Logic (Example for `temp_records` table)

The RLS policy for `SELECT` operations on any data table (e.g., `temp_records`) will look like this:

```sql
-- Enable RLS on the table
ALTER TABLE temp_records ENABLE ROW LEVEL SECURITY;

-- Policy for Super Users (can see everything)
CREATE POLICY "Super users can view all records"
ON temp_records FOR SELECT USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'super_user'
);

-- Policy for Company Admins and Ops (can see all records in their company)
CREATE POLICY "Company admins and ops can view company records"
ON temp_records FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM users
    WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    AND role IN ('company_admin', 'ops')
  )
  AND company_id = (SELECT company_id FROM users WHERE id = auth.uid())
);

-- Policy for Managers (can only see records in their assigned location(s))
CREATE POLICY "Managers can view records in their assigned locations"
ON temp_records FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM users
    WHERE role = 'manager'
    AND location_id = temp_records.location_id -- Assuming location_id is on temp_records
  )
  AND company_id = (SELECT company_id FROM users WHERE id = auth.uid())
);
```

Similar policies will be created for `INSERT`, `UPDATE`, and `DELETE` operations, with additional checks based on the user's `role` to enforce the permissions matrix (e.g., only `company_admin` can `INSERT` into `checklists`).

## 4. Application Logic Changes

The frontend and backend will need to be updated to:
1.  Fetch the user's `company_id` and `role` upon login.
2.  Use this information to conditionally render UI elements (e.g., hide "Create Checklist" button for `ops` and `manager`).
3.  Ensure all data creation/update requests automatically include the user's `company_id` to prevent accidental data leakage.

This design provides a robust foundation for the multi-tenant and RBAC requirements. The next steps will involve implementing these changes in the Supabase database and the React application.
