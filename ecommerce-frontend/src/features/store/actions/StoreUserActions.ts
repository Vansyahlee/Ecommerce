"use server";

import { revalidatePath } from "next/cache";
import { pool } from "~/lib/db";

export async function toggleBlockUser(
  userId: string
): Promise<void> {
  const res = await pool.query<{ isBlocked: boolean }>(
    `SELECT "isBlocked" FROM "user" WHERE id = $1`,
    [userId]
  );

  if (res.rows.length === 0) return;

  const currentStatus = res.rows[0].isBlocked;

  await pool.query(
    `UPDATE "user" SET "isBlocked" = $1, "updatedAt" = NOW() WHERE id = $2`,
    [!currentStatus, userId]
  );

  revalidatePath("/dashboard/admin/transactions");
}