"use client"

import type { ListingType } from "@/@types/api.types"
import { CONDITION_OPTIONS } from "@/constant/item-options"
import { createSlug, formatCurrency } from "@/lib/helper"
import Link from "next/link"
import type React from "react"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { CogIcon, Type, Heart, Eye } from "lucide-react"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ItemCardProps {
  listing: ListingType
  layout?: "list" | "grid"
}

const ItemCard: React.FC<ItemCardProps> = ({ listing, layout = "grid" }) => {
  const {
    $id,
    imageUrls,
    price,
    category,
    condition,
    availability,
    priceRange,
    displayTitle,
    model,
    type,
    description,
  } = listing

  const slug = createSlug(displayTitle)
  const conditionLabel = CONDITION_OPTIONS.find((opt) => opt.value === condition)?.label

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: "easeOut" }}>
      <Link href={`/detail/${slug}/${$id}`}>
        <Card
          className={cn(
            `group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 
                        bg-white/80 backdrop-blur-sm hover:bg-white overflow-hidden`,
            layout === "list" && "flex-row border-primary/30 gap-0 md:gap-4",
          )}
        >
          <div
            className={cn(
              `relative w-full min-h-28 !h-[240px] overflow-hidden`,
              layout === "list" && `w-[152px] !h-auto md:w-[220px] md:h-[210px] shrink-0`,
            )}
          >
            <Image
              src={imageUrls[0] || "/placeholder.svg"}
              alt={displayTitle}
              className={cn(
                `w-full h-full object-cover transition-transform duration-500 
                                group-hover:scale-110`,
                layout === "list" && "!rounded-r-none",
              )}
              width={layout === "list" ? 300 : 800}
              height={layout === "list" ? 200 : 500}
            />

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 right-4 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Condition badge */}
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-800 font-medium px-2 py-1 text-xs">
                {conditionLabel}
              </Badge>
            </div>
          </div>

          <CardContent
            className={cn(
              `p-6 space-y-3`,
              layout === "list" && "flex-1 !p-[10px_16px_18px_16px] md:!p-[18px_16px_18px_0px]",
            )}
          >
            <div className="space-y-2">
              <h3
                className={cn(
                  `font-bold text-lg text-gray-900 capitalize
                                    line-clamp-2 group-hover:text-primary transition-colors`,
                  layout === "list" && "w-auto tracking-tighter sm:tracking-normal",
                )}
              >
                {displayTitle}
              </h3>
              <p
                className={cn(
                  `text-gray-600 text-sm line-clamp-2`,
                  layout === "list" && "w-auto h-auto whitespace-break-spaces",
                )}
              >
                {description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="font-bold text-2xl text-primary">{formatCurrency(price)}</p>
              <div className="text-xs text-gray-500">
                {availability === "in_stock" ? "✅ In Stock" : "❌ Out of Stock"}
              </div>
            </div>

            <div className={cn(`flex flex-wrap items-center gap-2`, layout === "list" && "mt-1 hidden sm:flex")}>
              <Badge
                variant="outline"
                className="border-purple-200 bg-purple-50 text-purple-700 
                                items-center gap-1.5 text-xs font-medium py-1 px-2"
              >
                <Type className="size-3" />
                {type?.toLowerCase()}
              </Badge>
              <Badge
                variant="outline"
                className="border-blue-200 bg-blue-50 text-blue-700
                                gap-1.5 text-xs font-medium py-1 px-2"
              >
                <CogIcon className="size-3" />
                {category.toLowerCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

export default ItemCard
