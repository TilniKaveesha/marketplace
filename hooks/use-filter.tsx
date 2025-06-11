"use client";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";

type FilterKeys =
  | "category"
  | "model"
  | "type"
  | "price"
  | "condition"
  | "keyword";

type FilterTypes = {
  category: string[];
  model: string[];
  type: string[];
  price: string;
  condition: string[];
  keyword: string;
};

const useFilter = () => {
  const [category, setcategory] = useQueryState(
    "category",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [model, setModel] = useQueryState(
    "model",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const [price, setPrice] = useQueryState(
    "price",
    parseAsString.withDefault("")
  );

  const [type, setType] = useQueryState(
    "type",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [condition, setCondition] = useQueryState(
    "condition",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [keyword, setKeyword] = useQueryState(
    "keyword",
    parseAsString.withDefault("")
  );

  const getFilters = () => ({
    category,
    model,
    price,
    type,
    condition,
    keyword,
  });

  const updateFilter = (
    key: FilterKeys,
    values: string[] | string | number | null
  ) => {
    switch (key) {
      case "category":
        return setcategory(Array.isArray(values) ? values : null);
      case "price":
        return setPrice(typeof values === "string" ? values : null);
      case "model":
        return setModel(Array.isArray(values) ? values : null);
      case "type":
        return setType(Array.isArray(values) ? values : null);
      case "condition":
        return setCondition(Array.isArray(values) ? values : null);
      case "keyword":
        return setKeyword(typeof values === "string" ? values : null);
      default:
        throw new Error(`Invalid filter key: ${key}`);
    }
  };

  const clearFilter = (key: FilterKeys) => {
    updateFilter(key, null);
  };

  // Clear all filters
  const clearFilters = async () => {
    await Promise.all([
      setcategory(null),
      setModel(null),
      setPrice(null),
      setType(null),
      setCondition(null),
      setKeyword(null),
    ]);
  };
  return {
    filters: getFilters(),
    updateFilter,
    clearFilter,
    clearFilters,
  };
};

export default useFilter;