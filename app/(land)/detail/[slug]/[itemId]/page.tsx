"use client";
import React, { useState } from "react";
import { ListingType } from "@/@types/api.types";
import NavBreadCrumb from "@/components/NavBreadCrumb";
import { getSingleListingQueryFn } from "@/lib/fetcher";
import { slugToCarName } from "@/lib/helper";
import { useQuery } from "@tanstack/react-query";
import ItemHeader from "../../_components/item-header";
import ItemCarousel from "../../_components/item-carousel";
import ItemDetails from "../../_components/item-details";
import ShopInfo from "../../_components/shop-info";
import useCurrentUser from "@/hooks/api/use-current-user";
import { useRouter } from "next/navigation";

const ItemDetail = ({
  params,
}: {
  params: {
    slug: string;
    itemId: string;
  };
}) => {
  const { slug, itemId } = params;
  const itemName = slugToCarName(slug);
  const { data:session } = useCurrentUser();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [isLoading, setIsLoading] = useState(false);

  

  const { data, isPending, isError } = useQuery({
    queryKey: ["listing", itemId],
    queryFn: () => getSingleListingQueryFn(itemId),
  });

  const listing = data?.listing as ListingType;

  

  const breadcrumbItems = [
    { label: "Community Shop", href: "/" },
    { label: "Items", href: "/search" },
    { label: itemName },
  ];
  return (
    <main className="container mx-auto px-4 pt-3 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-3">
          <NavBreadCrumb {...{ breadcrumbItems }} />

          {/* {Item DisplayTitle Section} */}
          <ItemHeader
            displayTitle={listing?.displayTitle}
            condition={listing?.condition}
            type={listing?.type}
            model={listing?.model}

            isPending={isPending || isError}
          />

          <div
            className="grid grid-cols-1 md:grid-cols-[1fr_340px]
           gap-5"
          >
            <div className="pt-1">
              {/* {ItemCarousel} */}
              <ItemCarousel
                imageUrls={listing?.imageUrls}
                isPending={isPending || isError}
              />
              <ItemDetails listing={listing} isPending={isPending || isError} />
            </div>
            <div>
              <ShopInfo
                displayTitle={listing?.displayTitle}
                price={listing?.price}
                shopId={listing?.shopId}
                ShopName={listing?.shop?.ShopName || ""}
                shopOwnerUserId={listing?.shop?.userId || ""}
                isPending={isPending || isError}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ItemDetail;