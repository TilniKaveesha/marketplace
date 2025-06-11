"use client";

import { useRouter } from "next/navigation";
import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  AVAILABILITY_OPTIONS,
  CATEGORY_OPTIONS,
  CONDITION_OPTIONS,
  MODEL_OPTIONS,
  PRICE_RANGE_OPTIONS,
  TYPE_OPTIONS,
} from "@/constant/item-options";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronRight, RefreshCcw } from "lucide-react";

// Unified interface
interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  label: string;
  options: FilterOption[];
  placeholder: string;
  onChange: (value: string) => void;
  value?: string;
}

interface FilterField {
  key: keyof typeof filterOptions;
  label: string;
  placeholder: string;
}

const FILTER_FIELDS: FilterField[] = [
  { key: "category", label: "Category", placeholder: "Select Category" },
  { key: "model", label: "Model", placeholder: "Select Model" },
  { key: "condition", label: "Condition", placeholder: "Select Condition" },
  { key: "type", label: "Type", placeholder: "Select Type" },
  { key: "availability", label: "Availability", placeholder: "Select Availability" },
  { key: "price", label: "Price", placeholder: "Select Price Range" },
];

const filterOptions: Record<string, FilterOption[]> = {
  category: CATEGORY_OPTIONS,
  model: MODEL_OPTIONS,
  condition: CONDITION_OPTIONS,
  type: TYPE_OPTIONS,
  availability: AVAILABILITY_OPTIONS,
  price: PRICE_RANGE_OPTIONS.filter((item) => item.value !== "custom"),
};

const HeroFilter: React.FC = () => {
  const router = useRouter();
  const [selectedFilters, setSelectedFilters] = useState<
    Partial<Record<keyof typeof filterOptions, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilterChange = useCallback(
    (key: keyof typeof filterOptions, value: string) => {
      setSelectedFilters((prev) => ({
        ...prev,
        [key]: value || undefined,
      }));
      setError(null);
    },
    []
  );

  const handleReset = useCallback(() => {
    setSelectedFilters({});
    setError(null);
  }, []);

  const handleSearch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      let hasValidFilter = false;

      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
          hasValidFilter = true;
        }
      });

      if (!hasValidFilter) {
        setError("Please select at least one filter option.");
        return;
      }

      await router.push(`/search?${params.toString()}`);
    } catch (err) {
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilters, router]);

  const filterFields = useMemo(() => FILTER_FIELDS, []);

  return (
    <div className="w-full flex flex-col gap-6 pt-6 px-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md text-center">
          {error}
        </div>
      )}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-black">
        {filterFields.map((field) => (
          <FilterSelect
            key={field.key}
            label={field.label}
            options={filterOptions[field.key]}
            placeholder={field.placeholder}
            value={selectedFilters[field.key]}
            onChange={(value) => handleFilterChange(field.key, value)}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          className="w-full sm:w-auto flex items-center justify-between py-6 px-6"
          onClick={handleSearch}
          disabled={isLoading}
          aria-label="Search items"
        >
          <span className="flex items-center gap-1 font-light">
            <b className="font-bold">1000+</b>
            LISTED ITEMS
          </span>
          <span className="flex items-center gap-1 uppercase font-semibold">
            {isLoading ? "Searching..." : "Search Now"}
            <ChevronRight />
          </span>
        </Button>
        <Button
          variant="outline"
          className="w-full sm:w-auto py-6 px-6"
          onClick={handleReset}
          disabled={isLoading}
          aria-label="Reset filters"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
      </div>

      <p className="text-muted-foreground text-sm text-center text-gray-800">
        Want to search more customized
        <Link
          href="/search"
          className="text-black underline font-bold ml-2"
          aria-label="Go to advanced search"
        >
          Advanced Search
        </Link>
      </p>
    </div>
  );
};

const FilterSelect: React.FC<FilterSelectProps> = React.memo(
  ({ label, options, placeholder, onChange, value }) => {
    return (
      <div className="w-full placeholder:text-gray-800">
        <Select onValueChange={onChange} value={value}>
          <SelectTrigger
            className="w-full [data-placeholder]:text-gray-800"
            aria-label={`Select ${label}`}
          >
            <SelectValue className="placeholder:text-gray-800" placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{label}</SelectLabel>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  aria-label={option.label}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
  }
);

FilterSelect.displayName = "FilterSelect";

export default HeroFilter;