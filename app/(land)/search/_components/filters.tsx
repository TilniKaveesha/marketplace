"use client"
import FilterAccordionItem from '@/components/FilterAccordionItem';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { CATEGORY_OPTIONS, CONDITION_OPTIONS, MODEL_OPTIONS, PRICE_RANGE_OPTIONS, TYPE_OPTIONS } from '@/constant/item-options';
import useDebounce from '@/hooks/use-debounce';
import useFilter from '@/hooks/use-filter';
import { calculatePriceRange, formatPriceRange } from '@/lib/helper';
import React, { useState } from 'react'

const Filters = () => {
    const { filters, updateFilter, clearFilter, clearFilters } = useFilter();
    const { minPrice, maxPrice } = calculatePriceRange();
    const [sliderValues, setSliderValues] = useState<number[]>([
    minPrice,
    maxPrice,
  ]);
  const [isCustomSeleted, setIsCustomSeleted] = useState(false);
  const debouncedSliderValues = useDebounce(sliderValues, 500);
  React.useEffect(() => {
    if (isCustomSeleted) {
      updateFilter("price", debouncedSliderValues.join("-"));
    }
  }, [debouncedSliderValues, isCustomSeleted, updateFilter]);

  const handlePriceChange = (values: string | string[] | undefined) => {
    if (isCustomSeleted) {
      setIsCustomSeleted(false);
      setSliderValues([minPrice, maxPrice]);
    }
    if (values) updateFilter("price", values);
  };

  const handlePriceCustomRange = (values: number[]) => {
    const [min, max] =
      Array.isArray(values) && values.length >= 2
        ? values[0] <= values[1]
          ? [values[0], values[1]]
          : [values[1], values[0]]
        : [0, 0];

    setSliderValues([min, max]);
    if (!isCustomSeleted) setIsCustomSeleted(true);
  };

  const handleClearAll = () => {
    clearFilters();
    clearFilter("price");
    setSliderValues([minPrice, maxPrice]);

  }
  return (
    <div className='space-y-4 text-black'>
        <div className='mb-3'>
            <div className='flex items-center justify-between rounded-[4px_4px_0_0] bg-primary text-black p-[8px_16px]'>
                <h2 className='font-bold text-base'>Filters</h2>
                <Button variant='link' className='!h-auto text-black/80 font-light !py-0'>Reset All</Button>
            </div>
            <Accordion type="single" collapsible defaultValue="brands">
          {/* {categories} */}
          <FilterAccordionItem
            title=" Categories"
            value="category"
            filterType="checkbox"
            options={CATEGORY_OPTIONS}
            selectedValues={filters.category||[]}
            onValuesChange={(values:any) => {
                updateFilter("category", values);
            }}
            hasSearch
          />
        </Accordion>
        </div>

        <Accordion
        type="multiple"
        defaultValue={[
          'brands',
          'model',
          'condition',
          'type',
          'availability',
          'price-range',]}
          >
             {/* {Price} */}
        <FilterAccordionItem
          title="Price Range"
          value="price-range"
          filterType="radio"
          options={PRICE_RANGE_OPTIONS}
          selectedValues={filters.price}
          onValuesChange={handlePriceChange}
          renderCustom={
            <div className="py-1">
              <div className="flex items-center justify-between mb-[5px]">
                <h5 className="font-medium text-sm">Price</h5>
                <span className="text-sm">
                  {formatPriceRange(sliderValues[0], sliderValues[1])}
                  {""}
                </span>
              </div>

              <Slider
                min={minPrice}
                max={maxPrice}
                className="!cursor-pointer"
                defaultValue={[minPrice, maxPrice]}
                value={sliderValues}
                onValueChange={handlePriceCustomRange}
              />
            </div>
          }
        />
         {/*Type */}
        <FilterAccordionItem
          title="Type"
          value="type"
          filterType="checkbox"
          options={TYPE_OPTIONS}
          selectedValues={filters.type || []}
          onValuesChange={(values: any) => {
            updateFilter("type", values);
          }}
        />

         <FilterAccordionItem
          title="Models"
          value="model"
          filterType="checkbox"
          disabled={false}
          options={MODEL_OPTIONS}
          hasSearch={true}
          selectedValues={filters.model || []}
          onValuesChange={(values: any) => {
            updateFilter("model", values);
          }}
        />
         <FilterAccordionItem
          title="Condition"
          value="condition"
          filterType="checkbox"
          options={CONDITION_OPTIONS}
          selectedValues={filters.condition || []}
          onValuesChange={(values: any) => {
            updateFilter("condition", values);
          }}
        />




          </Accordion>
    </div>
  )
}

export default Filters; 