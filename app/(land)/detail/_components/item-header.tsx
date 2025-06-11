import React from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CONDITION_OPTIONS } from "@/constant/item-options";
import { CogIcon, FuelIcon, GaugeIcon, Tag } from "lucide-react";

type ItemHeaderProps = {
  displayTitle: string;
  condition: string;
  type: string;
  model:string;
  isPending: boolean;
};
const ItemHeader = ({
  displayTitle,
  condition,
  type,
  isPending,
  model,
}: ItemHeaderProps) => {
  const conditionLabel = CONDITION_OPTIONS.find(
    (opt) => opt.value === condition
  )?.label;
  return (
    <div>
      <div className="mb-3">
        <h1 className=" text-[28px] md:text-[32px] capitalize font-bold text-black">
          {isPending ? <Skeleton className="h-8 w-4/5" /> : displayTitle}
        </h1>
      </div>

      {isPending ? (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-14" />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 mb-3 text-black">
          <Badge
            variant="outline"
            className="border-primary items-center text-black
                           gap-1.5 text-[11px] capitalize !font-medium
                           py-[3px] px-2
                              "
          >
            <FuelIcon className="size-3 mb-px" />
            {type?.toLowerCase()}
          </Badge>

          <Badge
            variant="outline"
            className="border-primary text-black 
                gap-1.5 text-[11px] capitalize !font-medium
                           py-[3px] px-2
                              "
          >
            <Tag className="size-3  mb-px" />
            {conditionLabel}
          </Badge>

          <Badge
            variant="outline"
            className="border-primary text-black
                           gap-1.5 text-[11px] capitalize !font-medium
                           py-[3px] px-2
                              "
          >
            <CogIcon className="size-3  mb-px" />
            {model.toUpperCase()}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default ItemHeader;