import { APP_CONFIG } from "@/lib/app-config";
import { createAnonymousClient } from "@/lib/appwrite";
import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const categories = searchParams.get("category")?.split(",") || [];
        const models = searchParams.get("model")?.split(",") || [];
        const priceRange = searchParams.get("price")?.split(",") || [];
        const type = searchParams.get("type")?.split(",") || [];
        const condition = searchParams.get("condition")?.split(",") || [];
        const availability = searchParams.get("availability")?.split(",") || [];
        const keyword = searchParams.get("keyword") || "";

        const queries: any[] = [];

        if (categories.length) queries.push(Query.equal("category", categories));
        if (models.length) queries.push(Query.equal("model", models));
        if (type.length) queries.push(Query.equal("type", type));
        if (condition.length) queries.push(Query.equal("condition", condition));
        if (availability.length) queries.push(Query.equal("availability", availability));

        if (priceRange.length === 2) {
            const [minPrice, maxPrice] = priceRange.map(Number);
            if (!isNaN(minPrice)) queries.push(Query.greaterThanEqual("price", minPrice));
            if (!isNaN(maxPrice)) queries.push(Query.lessThanEqual("price", maxPrice));
        }

        if (keyword) {
            queries.push(Query.search("displayTitle", keyword));
        }

        const { databases } = await createAnonymousClient();

        const listings = await databases.listDocuments(
            APP_CONFIG.APPWRITE.DATABASE_ID,
            APP_CONFIG.APPWRITE.ITEM_LISTING_ID,
            queries
        );

        return NextResponse.json({
            message: "Listings fetched successfully",
            listings: listings.documents
        });

    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
