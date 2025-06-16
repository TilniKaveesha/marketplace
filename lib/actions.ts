"use server";

import { APP_CONFIG } from "@/lib/app-config";
import { createSessionClient } from "@/lib/appwrite";
import { redirect } from "next/navigation";

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const { databases } = await createSessionClient();

  await databases.updateDocument(
    APP_CONFIG.APPWRITE.DATABASE_ID,
    APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
    orderId,
    { status: newStatus }
  );

  redirect(`/my-shop/orders/${orderId}`);
}