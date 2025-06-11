import { ListingType } from "@/@types/api.types";
import ChatSellerButton from "@/components/ChatSellerButton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TYPE_OPTIONS,
  CONDITION_OPTIONS,
  MODEL_OPTIONS,
} from "@/constant/item-options";
import {
  CheckSquare,
  CogIcon,
  FuelIcon,
  GaugeIcon,
  TagIcon,
} from "lucide-react";
import React from "react";

const ItemDetails = ({
  listing,
  isPending,
}: {
  listing: ListingType;
  isPending: boolean;
}) => {
  const conditionLabel =
    CONDITION_OPTIONS?.find((option) => option.value === listing?.condition)
      ?.label || "N/A";

  const modelLabel =
    MODEL_OPTIONS?.find((option) => option.value === listing?.model)
      ?.label || "N/A";

  const TypeLabel =
    TYPE_OPTIONS?.find((option) => option.value === listing?.type)
      ?.label || "N/A";
  return (
    <div className="w-full h-auto pt-2">
      {isPending ? (
        <Skeleton className="w-full h-[350px] rounded-t-none mb-4" />
      ) : (
        <Card
          className="!rounded-t-none rounded-b-[8px]
                shadow-none
                "
        >
          <CardContent className="!p-4 !py-6">
            <div className="mb-4">
              <h2 className="font-bold text-lg mb-2">Description</h2>
              <div className="text-sm font-light">{listing?.description}</div>
              <ul className="my-4 flex items-center font-light gap-5">
                <li
                  className="flex flex-col capitalize items-center
                                text-sm gap-2
                              "
                >
                  <span className="border-2 rounded-full p-3">
                    <FuelIcon className="size-5" />
                  </span>
                  {listing?.type?.toLowerCase()}
                </li>

                <li
                  className="flex flex-col capitalize items-center
                                text-sm gap-2
                              "
                >
                  <span className="border-2 rounded-full p-3">
                    <TagIcon className="size-5" />
                  </span>
                  {conditionLabel}
                </li>
              </ul>
            </div>

            <Separator />
            <div className="my-4">
              <ul className="grid grid-cols-2 gap-5">

                <li>
                  <h5
                    className="uppercase text-xs
                   text-muted-foreground mb-[1px]"
                  >
                    Model{" "}
                  </h5>
                  <p className="text-sm">{modelLabel}</p>
                </li>


                <li>
                  <h5
                    className="uppercase text-xs
                   text-muted-foreground mb-[1px]"
                  >
                     Type
                  </h5>
                  <p className="text-sm">{TypeLabel}</p>
                </li>


              </ul>
            </div>

            <Separator />
            <div className="my-4 w-full max-w-[170px]">
              <ChatSellerButton
                displayTitle={listing?.displayTitle}
                shopOwnerUserId={listing?.shop?.userId || ""}
                ShopName={listing?.shop?.ShopName || ""}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ItemDetails;