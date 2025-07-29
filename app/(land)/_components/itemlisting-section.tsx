"use client"
import type { ListingType } from "@/@types/api.types"
import ItemCard from "@/components/ItemCard"
import EmptyState from "@/components/EmptyState"
import ItemListingSkeleton from "@/components/skeleton-loader/itemlisting-skeleton"
import { Button } from "@/components/ui/button"
import { CATEGORY_OPTIONS } from "@/constant/item-options"
import { getAllListingQueryFn } from "@/lib/fetcher"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import React from "react"
import { motion } from "framer-motion"
import { ArrowRight, TrendingUp } from "lucide-react"

const BRANDS = [{ value: "all", label: "All Categories" }, ...CATEGORY_OPTIONS]

const ItemListing = () => {
  const [active, setActive] = React.useState(BRANDS[0]?.value)
  const { data, isPending } = useQuery({
    queryKey: ["group-by-brand", active],
    queryFn: () =>
      getAllListingQueryFn({
        category: active !== "all" ? [active] : [],
      }),
    staleTime: 0,
  })
  const listings: ListingType[] = data?.listings || []

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  return (
    <section className="w-full py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Popular Items</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover Amazing
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"> Products</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse through thousands of carefully curated items from trusted sellers in your community
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-2 overflow-x-auto pb-4 mb-12"
        >
          <div className="flex gap-2 mx-auto">
            {BRANDS.map((item, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isPending}
                className={cn(
                  `px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all duration-300
                  border-2 hover:shadow-lg`,
                  item.value === active
                    ? "bg-primary text-white border-primary shadow-lg"
                    : "bg-white text-gray-700 border-gray-200 hover:border-primary/30 hover:bg-primary/5",
                  isPending && "pointer-events-none opacity-50",
                )}
                onClick={() => setActive(item.value)}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Items Grid */}
        {isPending ? (
          <ItemListingSkeleton
            className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            layout="grid"
          />
        ) : listings?.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <EmptyState message="No items found in this category" />
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {listings?.map((listing, index) => (
              <motion.div key={listing.$id} variants={itemVariants}>
                <ItemCard listing={listing} layout="grid" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center mt-16"
        >
          <Link href="/search">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold px-8 py-4 h-auto rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <span>Explore All Items</span>
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default ItemListing
