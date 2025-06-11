"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import AllListing from "@/components/shop/all-listing";
import ShopInfo from "@/components/shop/shop-info";
import { getShopByIdQueryFn } from "@/lib/fetcher";
import { ListingType } from "@/@types/api.types";

const Shop = () => {
  const params = useParams();
  const shopId = params.shopId as string;

  const { data, isPending } = useQuery({
    queryKey: ["shop", shopId],
    queryFn: () => getShopByIdQueryFn(shopId),
  });

  const shop = data?.shop;
  const listings = data?.listings || ([] as ListingType[]);

  return (
    <main className="container mx-auto px-4 pt-3 pb-8 flex-1 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div
          className="grid grid-cols-1 flex-col-reverse md:grid-cols-[305px_1fr] 
        gap-5"
        >
          <div className="pt-1">
            <ShopInfo
              ShopName={shop?.ShopName}
              shopId={shop?.$id}
              Description={shop?.Description}
              shopOwnerUserId={shop?.userId}
              isShopOwner={false}
              isPending={isPending}
            />
          </div>
          <div className="pt-1">
            <AllListing listings={listings} isPending={isPending} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Shop;