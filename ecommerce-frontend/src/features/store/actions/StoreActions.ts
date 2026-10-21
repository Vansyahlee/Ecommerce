"use server";

import { revalidatePath } from "next/cache";
import { pool } from "~/lib/db";
import { toggleBlockUser } from "./StoreUserActions";
import crypto from "crypto";

export interface StoreProfile {
  id: string;
  name: string;
  slug: string;
  adminId: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  adminAvatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreProduct {
  id: string;
  sku: string;
  storeId: string | null;
  name: string;
  description: string;
  price: string;
  stock: number;
  category: string;
  expiryDate: string | null;
  metadata: Record<string, unknown> | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  expiryDate: string;
  image?: string | null;
  unit?: string;
  garansi?: string;
  diskon?: string;
}

export type TxStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface StoreTransaction {
  id: string;
  storeId: string;
  status: TxStatus;
  amount: string;
  currency: string;
  userId: string | null;
  userEmail: string | null;
  details: string | null;
  createdAt: string;
}

export interface SalesPoint {
  ts: string;
  revenue: number;
  failed: number;
}

export interface UserProfileUpdate {
  name?: string;
  phone?: string;
  bio?: string;
  instagram?: string;
  whatsapp?: string;
}

const generateCustomSegment = (
  len: number,
  uppercaseOnly = false
) => {
  const chars = uppercaseOnly
    ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

function asTxStatus(raw: string): TxStatus {
  const v = raw.toUpperCase();
  if (v === "SUCCESS" || v === "FAILED" || v === "PENDING") return v;
  return "PENDING";
}

async function getStoreIdByAdminId(adminId: string): Promise<string | null> {
  const res = await pool.query<{ id: string }>(
    `SELECT id FROM "Store" WHERE "adminId" = $1`,
    [adminId]
  );
  return res.rows[0]?.id ?? null;
}

export async function getStoreProducts(
  adminId: string,
  limit = 200
): Promise<StoreProduct[]> {
  const storeId = await getStoreIdByAdminId(adminId);
  if (!storeId) return [];

  const res = await pool.query<{
    id: string;
    sku: string;
    storeId: string | null;
    name: string;
    description: string;
    price: string;
    stock: number;
    category: string;
    expiryDate: Date | null;
    metadata: Record<string, unknown> | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>(
    `
    SELECT
      p.id,
      p.sku,
      p."storeId",
      p.name,
      p.description,
      p.price::text AS price,
      p.stock,
      p.category,
      p."expiryDate",
      p.metadata,
      p.image,
      p."createdAt",
      p."updatedAt"
    FROM "Product" p
    WHERE p."storeId" = $1
    ORDER BY p."createdAt" DESC
    LIMIT $2
    `,
    [storeId, limit]
  );

  return res.rows.map((r) => ({
    id: r.id,
    sku: r.sku,
    storeId: r.storeId,
    name: r.name,
    description: r.description,
    price: r.price,
    stock: r.stock,
    category: r.category,
    expiryDate: r.expiryDate ? r.expiryDate.toISOString() : null,
    metadata: r.metadata,
    image: r.image,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function createProduct(
  adminId: string,
  data: ProductFormData
): Promise<void> {
  const storeId = await getStoreIdByAdminId(adminId);

  if (!storeId) {
    throw new Error("System failure: No Store record exists in database.");
  }

  const seg1 = generateCustomSegment(3);
  const seg2 = generateCustomSegment(4, true);
  const seg3 = generateCustomSegment(4);
  const tail = crypto.randomUUID().split("-").slice(3).join("-");

  const finalSku = data.sku || `VNZZS-FR77VNZ55${seg1}-${seg2}-${seg3}-${tail}`;

  const metadata: Record<string, unknown> = {};
  if (data.unit) metadata.unit = data.unit;
  if (data.garansi) metadata.garansi = data.garansi;
  if (data.diskon && !isNaN(Number(data.diskon)) && Number(data.diskon) > 0) {
    metadata.diskon = Number(data.diskon);
  }

  await pool.query(
    `INSERT INTO "Product" (
      id, 
      sku, 
      name, 
      description, 
      price, 
      stock, 
      category, 
      "expiryDate", 
      image, 
      "storeId",
      metadata,
      "createdAt", 
      "updatedAt"
    )
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
    [
      finalSku,
      data.name,
      data.description,
      data.price,
      data.stock,
      data.category,
      data.expiryDate ? new Date(data.expiryDate) : null,
      data.image || null,
      storeId,
      JSON.stringify(metadata),
    ]
  );

  revalidatePath("/dashboard/admin/products");
}

export async function updateProduct(
  productId: string,
  data: Partial<ProductFormData>
): Promise<void> {
  const fields: Array<{ key: string; value: unknown }> = [];

  if (data.name) fields.push({ key: "name", value: data.name });
  if (data.sku) fields.push({ key: "sku", value: data.sku });
  if (data.description) fields.push({ key: "description", value: data.description });
  if (data.price !== undefined) fields.push({ key: "price", value: data.price });
  if (data.stock !== undefined) fields.push({ key: "stock", value: data.stock });
  if (data.category) fields.push({ key: "category", value: data.category });
  if (data.image !== undefined) fields.push({ key: "image", value: data.image });
  if (data.expiryDate !== undefined) {
    fields.push({
      key: "expiryDate",
      value: data.expiryDate ? new Date(data.expiryDate) : null,
    });
  }

  if (data.unit || data.garansi || data.diskon !== undefined) {
    const currentMetaRes = await pool.query<{ metadata: Record<string, unknown> | null }>(
      `SELECT metadata FROM "Product" WHERE id = $1`,
      [productId]
    );
    const currentMeta = currentMetaRes.rows[0]?.metadata ?? {};
    const newMeta: Record<string, unknown> = { ...currentMeta };
    if (data.unit) newMeta.unit = data.unit;
    if (data.garansi) newMeta.garansi = data.garansi;
    if (data.diskon !== undefined) {
      if (data.diskon && !isNaN(Number(data.diskon)) && Number(data.diskon) > 0) {
        newMeta.diskon = Number(data.diskon);
      } else {
        delete newMeta.diskon;
      }
    }
    fields.push({ key: "metadata", value: JSON.stringify(newMeta) });
  }

  if (fields.length === 0) return;

  const sets = fields.map((f, i) => `"${f.key}" = $${i + 2}`).join(", ");
  const values = fields.map((f) => f.value);

  await pool.query(
    `UPDATE "Product" SET ${sets}, "updatedAt" = NOW() WHERE id = $1`,
    [productId, ...values]
  );

  revalidatePath("/dashboard/admin/products");
}

export async function deleteProduct(productId: string): Promise<void> {
  await pool.query(`DELETE FROM "Product" WHERE id = $1`, [productId]);
  revalidatePath("/dashboard/admin/products");
}

export async function getStoreTransactions(
  adminId: string,
  limit = 200
): Promise<StoreTransaction[]> {
  const storeId = await getStoreIdByAdminId(adminId);
  if (!storeId) return [];

  const res = await pool.query<{
    id: string;
    storeId: string;
    status: string;
    amount: string;
    currency: string;
    userId: string | null;
    userEmail: string | null;
    details: string | null;
    createdAt: Date;
  }>(
    `
    SELECT
      t.id,
      t."storeId",
      t.status,
      t.amount::text AS amount,
      t.currency,
      t."userId",
      u.email AS "userEmail",
      t.details,
      t."createdAt"
    FROM "StoreTransaction" t
    LEFT JOIN "user" u ON u.id = t."userId"
    WHERE t."storeId" = $1
    ORDER BY t."createdAt" DESC
    LIMIT $2
    `,
    [storeId, limit]
  );

  return res.rows.map((r) => ({
    id: r.id,
    storeId: r.storeId,
    status: asTxStatus(r.status),
    amount: r.amount,
    currency: r.currency,
    userId: r.userId,
    userEmail: r.userEmail,
    details: r.details,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function updateTransactionStatus(
  transactionId: string,
  status: 'SUCCESS' | 'FAILED'
): Promise<void> {
  await pool.query(
    `UPDATE "StoreTransaction" SET status = $1 WHERE id = $2`,
    [status, transactionId]
  );
  revalidatePath("/dashboard/admin/transactions");
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  await pool.query(`DELETE FROM "StoreTransaction" WHERE id = $1`, [transactionId]);
  revalidatePath("/dashboard/admin/transactions");
}

export async function reduceProductStock(sku: string, qty: number): Promise<void> {
  await pool.query(
    `UPDATE "Product" SET stock = stock - $1, "updatedAt" = NOW() WHERE sku = $2`,
    [qty, sku]
  );
  revalidatePath("/dashboard/admin/products");
}

export async function getSalesAnalytics(
  adminId: string,
  days = 14
): Promise<SalesPoint[]> {
  const storeId = await getStoreIdByAdminId(adminId);
  if (!storeId) return [];

  const res = await pool.query<{
    day: Date;
    revenue: string;
    failed: string;
  }>(
    `
    SELECT
      date_trunc('day', t."createdAt") AS day,
      COALESCE(SUM(CASE WHEN t.status = 'SUCCESS' THEN t.amount ELSE 0 END), 0)::text AS revenue,
      COALESCE(SUM(CASE WHEN t.status = 'FAILED' THEN 1 ELSE 0 END), 0)::text AS failed
    FROM "StoreTransaction" t
    WHERE t."storeId" = $1
      AND t."createdAt" >= NOW() - ($2 || ' days')::interval
    GROUP BY day
    ORDER BY day ASC
    `,
    [storeId, String(days)]
  );

  return res.rows.map((r) => ({
    ts: r.day.toISOString(),
    revenue: Number(r.revenue) || 0,
    failed: Number(r.failed) || 0,
  }));
}

export async function updateStoreProfile(
  adminId: string,
  input: {
    name?: string;
    slug?: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    adminAvatarUrl?: string | null;
  }
): Promise<void> {
  const storeId = await getStoreIdByAdminId(adminId);
  if (!storeId) return;

  const fields: Array<{ key: string; value: string | null }> = [];
  if (typeof input.name === "string") fields.push({ key: "name", value: input.name });
  if (typeof input.slug === "string") fields.push({ key: "slug", value: input.slug });
  if ("logoUrl" in input) fields.push({ key: "logoUrl", value: input.logoUrl ?? null });
  if ("bannerUrl" in input) fields.push({ key: "bannerUrl", value: input.bannerUrl ?? null });
  if ("adminAvatarUrl" in input) fields.push({ key: "adminAvatarUrl", value: input.adminAvatarUrl ?? null });

  if (fields.length === 0) return;

  const sets = fields.map((f, i) => `"${f.key}" = $${i + 2}`).join(", ");
  const values = fields.map((f) => f.value);

  await pool.query(
    `UPDATE "Store" SET ${sets}, "updatedAt" = NOW() WHERE id = $1`,
    [storeId, ...values]
  );

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/profile");
}

export async function updateUserProfile(
  adminId: string,
  input: UserProfileUpdate
): Promise<void> {
  const fields: Array<{ key: string; value: string | null }> = [];
  if (typeof input.name === "string") fields.push({ key: "name", value: input.name });
  if (typeof input.phone === "string") fields.push({ key: "phone", value: input.phone });
  if (typeof input.bio === "string") fields.push({ key: "bio", value: input.bio });
  if (typeof input.instagram === "string") fields.push({ key: "instagram", value: input.instagram });
  if (typeof input.whatsapp === "string") fields.push({ key: "whatsapp", value: input.whatsapp });

  if (fields.length === 0) return;

  const sets = fields.map((f, i) => `"${f.key}" = $${i + 2}`).join(", ");
  const values = fields.map((f) => f.value);

  await pool.query(
    `UPDATE "user" SET ${sets}, "updatedAt" = NOW() WHERE id = $1`,
    [adminId, ...values]
  );

  revalidatePath("/dashboard/admin/profile");
}

export async function refundTransaction(
  adminId: string,
  transactionId: string
): Promise<void> {
  const storeId = await getStoreIdByAdminId(adminId);
  if (!storeId) return;

  await pool.query(
    `
    UPDATE "StoreTransaction"
    SET details = CASE
      WHEN details IS NULL OR details = '' THEN 'REFUND: executed'
      ELSE details || ' | REFUND: executed'
    END,
    "updatedAt" = NOW()
    WHERE id = $1 AND "storeId" = $2 AND status = 'FAILED'
    `,
    [transactionId, storeId]
  );

  revalidatePath("/dashboard/admin/transactions");
}

export async function blockUserForFailedPayment(
  adminId: string,
  transactionId: string
): Promise<void> {
  const storeId = await getStoreIdByAdminId(adminId);
  if (!storeId) return;

  const res = await pool.query<{ userId: string | null }>(
    `SELECT "userId" FROM "StoreTransaction" WHERE id = $1 AND "storeId" = $2 AND status = 'FAILED'`,
    [transactionId, storeId]
  );
  const userId = res.rows[0]?.userId;
  if (!userId) return;

  await toggleBlockUser(userId);
  revalidatePath("/dashboard/admin/transactions");
}

export async function getStoreMetadata(adminId: string): Promise<Record<string, unknown>> {
  const storeId = await getStoreIdByAdminId(adminId);
  if (!storeId) return {};
  const res = await pool.query<{ metadata: Record<string, unknown> | null }>(
    `SELECT metadata FROM "Store" WHERE id = $1`,
    [storeId]
  );
  return res.rows[0]?.metadata ?? {};
}

export async function updateStoreMetadata(
  adminId: string,
  metadata: Record<string, unknown>
): Promise<void> {
  const storeId = await getStoreIdByAdminId(adminId);
  if (!storeId) return;
  await pool.query(
    `UPDATE "Store" SET metadata = $1, "updatedAt" = NOW() WHERE id = $2`,
    [JSON.stringify(metadata), storeId]
  );
  revalidatePath("/dashboard/admin/profile");
  revalidatePath("/dashboard/admin/products");
}