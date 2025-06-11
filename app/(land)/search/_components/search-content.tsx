"use client";
import NavBreadCrumb from '@/components/NavBreadCrumb';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import React, { useState } from 'react'
import Filters from './filters';
import AllListings from './all-listing';
import useFilter from '@/hooks/use-filter';
import { useQuery } from '@tanstack/react-query';
import { getAllListingQueryFn } from '@/lib/fetcher';

const SearchContent = () => {
    const { filters } = useFilter();
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const {data,isPending}= useQuery({
      queryKey: [
        "all-items",
        filters.category,
        filters.model,
        filters.price,
        filters.type,
        filters.condition,
        filters.keyword,
      ],
      queryFn: () =>
        getAllListingQueryFn({
          category: filters.category,
          condition: filters.condition,
          price: filters.price,
          model: filters.model,
          type: filters.type,
          keyword: filters.keyword,
        }),
        staleTime:0,
    })

    const listings = data?.listings || [];
    const breadcrumbItems = [
    { label: "Community Shop", href: "/" },
    { label: `${listings?.length || 0} results Items found` },
  ];
  const onFilterOpen = () => {
    setIsFiltersOpen(true);
  };

  return (
     <div className="space-y-3">
      <NavBreadCrumb breadcrumbItems={breadcrumbItems} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:hidden">
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetContent
              side="bottom"
              className="w-full h-[80vh] !p-0 sm:w-[100%] overflow-y-auto"
            >
              <Filters />
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden lg:block col-span-1">
          <Filters />
        </div>


         <div className="col-span-1 lg:col-span-3">
          {/* {AllListing} */}
           <AllListings
            listings={listings}
            isPending={false}
            onFilterOpen={onFilterOpen}
          />

        </div>
      </div>
    </div>

  )
}

export default SearchContent