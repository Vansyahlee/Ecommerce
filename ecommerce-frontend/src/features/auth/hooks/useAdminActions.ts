"use server";

import { revalidatePath } from "next/cache";
import { pool } from "~/lib/db";

export type AdminUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  isBlocked?: boolean | null;
  hasActiveSession?: boolean;
  lastLogin?: string | null;
};

export type AdminProduct = {
  id: string;
  name: string;
  description: string;
  price: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminTransaction = {
  id: string;
  action: string;
  adminId: string;
  adminEmail?: string | null;
  adminName?: string | null;
  details?: string | null;
  status: "SUCCESS" | "FAILED" | "SUSPICIOUS";
  createdAt: string;
};

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  lastLogin: Date | null;
  hasActiveSession: boolean;
}

export async function getUsers(): Promise<AdminUser[]> {
  try {
    const now = new Date();
    const result = await pool.query(
      `
      SELECT
        u.id, u.name, u.email, u.role,
        u."isBlocked",
        u."lastLogin",
        EXISTS (
          SELECT 1 FROM "session" s
          WHERE s."userId" = u.id AND s."expiresAt" > $1
        ) AS "hasActiveSession"
      FROM "user" u
      ORDER BY u."createdAt" DESC
      `,
      [now]
    );

    return result.rows.map((row: UserRow) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      isBlocked: row.isBlocked,
      hasActiveSession: Boolean(row.hasActiveSession),
      lastLogin: row.lastLogin ? row.lastLogin.toISOString() : null,
    }));
  } catch {
    return [];
  }
}

export async function toggleBlockUser(userId: string) {
  try {
    const sel = await pool.query(`SELECT "isBlocked" FROM "user" WHERE id = $1`, [userId]);
    if (sel.rows.length === 0) return;
    const current = sel.rows[0].isBlocked;
    await pool.query(`UPDATE "user" SET "isBlocked" = $1 WHERE id = $2`, [!current, userId]);
    revalidatePath("/dashboard/root");
  } catch {}
}

export async function getAppStats() {
  try {
    const productRes = await pool.query(`SELECT COUNT(*) as count FROM "Product"`);
    const auditRes = await pool.query(`SELECT COUNT(*) as count FROM "audit_log"`);
    
    return {
      totalProducts: parseInt(productRes.rows[0]?.count ?? "0", 10) || 0,
      totalOrders: parseInt(auditRes.rows[0]?.count ?? "0", 10) || 0,
    };
  } catch {
    return { totalProducts: 0, totalOrders: 0 };
  }
}

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string | null;
  stock?: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getProducts(limit = 200): Promise<AdminProduct[]> {
  try {
    // Try to read `stock` if the column exists; fall back if not.
    let result:
      | { rows: ProductRow[] }
      | { rows: Array<Omit<ProductRow, "stock">> };

    try {
      result = await pool.query(
        `
        SELECT
          p.id, p.name, p.description,
          p.price::text AS price,
          p.image,
          p.stock AS stock,
          p."createdAt", p."updatedAt"
        FROM "Product" p
        ORDER BY p."createdAt" DESC
        LIMIT $1
        `,
        [limit]
      );
    } catch {
      result = await pool.query(
        `
        SELECT
          p.id, p.name, p.description,
          p.price::text AS price,
          p.image,
          p."createdAt", p."updatedAt"
        FROM "Product" p
        ORDER BY p."createdAt" DESC
        LIMIT $1
        `,
        [limit]
      );
    }

    return result.rows.map((row: ProductRow) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      image: row.image,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      // Keep types unchanged; extra fields are OK for runtime use in UI.
      ...(typeof row.stock === "number" ? { stock: row.stock } : {}),
    }));
  } catch {
    return [];
  }
}

type TransactionRow = {
  id: string;
  action: string;
  adminId: string;
  adminEmail: string | null;
  adminName: string | null;
  details: string | null;
  createdAt: Date;
};

export async function getTransactions(limit = 200): Promise<AdminTransaction[]> {
  try {
    const result = await pool.query(
      `
      SELECT
        a.id, a.action, a."adminId",
        u.email AS "adminEmail",
        u.name AS "adminName",
        a.details,
        a."createdAt"
      FROM "audit_log" a
      LEFT JOIN "user" u ON u.id = a."adminId"
      ORDER BY a."createdAt" DESC
      LIMIT $1
      `,
      [limit]
    );

    return result.rows.map((row: TransactionRow) => {
      let status: "SUCCESS" | "FAILED" | "SUSPICIOUS" = "SUCCESS";
      const details = row.details?.toLowerCase() || "";
      
      if (details.includes("failed") || details.includes("gagal") || details.includes("error")) {
        status = "FAILED";
      } else if (details.includes("suspicious") || details.includes("mencurigakan") || details.includes("attack")) {
        status = "SUSPICIOUS";
      }

      return {
        id: row.id,
        action: row.action,
        adminId: row.adminId,
        adminEmail: row.adminEmail,
        adminName: row.adminName,
        details: row.details,
        status: status,
        createdAt: row.createdAt.toISOString(),
      };
    });
  } catch {
    return [];
  }
}

export async function refundTransaction(transactionId: string) {
  try {
    // Mark as refunded in the audit log details (non-destructive, append-only).
    await pool.query(
      `
      UPDATE "audit_log"
      SET details = CASE
        WHEN details IS NULL OR details = '' THEN 'REFUND: executed'
        ELSE details || ' | REFUND: executed'
      END
      WHERE id = $1
      `,
      [transactionId]
    );

    revalidatePath("/dashboard/root");
  } catch {}
}