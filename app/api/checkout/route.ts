import { APP_CONFIG } from "@/lib/app-config";
import { createSessionClient } from "@/lib/appwrite";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export const dynamic = "force-dynamic";

export const POST = async (req: NextRequest) => {
  try {
    const { databases } = await createSessionClient();
    const { listingId, paymentMethod } = await req.json();

    // Get listing details
    const listing = await databases.getDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ITEM_LISTING_ID,
      //APP_CONFIG.APPWRITE.SHOP_ID,
      listingId
    );

    const shop = await databases.getDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.SHOP_ID,
      listing.shopId
      );

    // Create order
    const order = await databases.createDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
      ID.unique(),
      {
        userId: listing.userId,
        listingId: listing.$id,
        shopId: listing.shopId,
        price: listing.price,
        paymentMethod,
        status: paymentMethod === "cash" ? "pending" : "paid",
        listingTitle: listing.displayTitle,
        //ShopName: listing.ShopName
      }
    );

    // Create real-time notification for seller
    await databases.createDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.NOTIFICATIONS_COLLECTION_ID,
      ID.unique(),
      {
        userId:shop.userId, // seller ID
        type: "order",
        message: `New order for ${listing.displayTitle}`,
        read: "false",
        link: `/my-shop/orders/${order.$id}`,
        relatedId: order.$id,
        timestamp: new Date().toISOString()
      }
    );

    return NextResponse.json({
      message: "Order created successfully",
      order,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      {
        message: error.message || "Failed to create order",
      },
      {
        status: 500,
      }
    );
  }
};