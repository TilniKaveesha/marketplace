import { ID } from "node-appwrite";
import { NextRequest, NextResponse } from "next/server";
import { APP_CONFIG } from "@/lib/app-config";
import { createSessionClient } from "@/lib/appwrite";
import { listingBackendSchema } from "@/validation/listing.validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = listingBackendSchema.parse(body);

    const { shopId } = validatedData;

    const { account, databases } = await createSessionClient();
    const user = await account.get();

    const shop = await databases.getDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.SHOP_ID,
      shopId
    );
    if (!shop || shop.userId !== user.$id) {
      return NextResponse.json(
        {
          error: "Invalid shop ID",
        },
        { status: 400 }
      );
    }

    const itemListing = await databases.createDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ITEM_LISTING_ID,
      ID.unique(),
      {
        ...validatedData,
        userId: user.$id,
        shop: shop.$id,
      }
    );

    return NextResponse.json({
      message: "Item listing created successfully",
      data: itemListing,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      {
        error: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}