import { AVAILABILITY_OPTIONS, CATEGORY_OPTIONS, CONDITION_OPTIONS, PRICE_RANGE_OPTIONS } from "@/constant/item-options";
import { describe } from "node:test";
import {z} from "zod";

const createEnum = (options: { value: string }[], fieldName: string) => {
  const values = options.map((item) => item.value);
  if (values.length === 0) {
    throw new Error(`No options found for ${fieldName}`);
  }
  return z.enum([values[0], ...values.slice(1)], {
    errorMap: (issue, ctx) => {
      if (issue.code === "invalid_enum_value") {
        return { message: `Please select a valid ${fieldName}` };
      }
      return { message: ctx.defaultError };
    },
  });
};


const itemcatregory = createEnum(CATEGORY_OPTIONS, "category");
const itemcondition = createEnum(CONDITION_OPTIONS, "condition");
const availability = createEnum(AVAILABILITY_OPTIONS, "availability");
const priceRange = createEnum(PRICE_RANGE_OPTIONS, "price range");  
export const listingSchema = z.object({
    category: itemcatregory,
    condition: itemcondition,
    availability: availability,
    priceRange: priceRange,
    model: z.string().min(1, {
      message: "Model is required",
    }),
    type: z.string().min(1, {
      message: "itemType is required",
    }),
    description: z.string().min(1, {
      message: "Description is required",
    }),
    price: z.number().min(1,{
      message: "Price is required",
    }),
    imageUrls: z.array(z.string()).min(3, {
      message: "At least Three image is required",
    })
}).required();

export const listingBackendSchema = listingSchema.extend({
  shopId: z
    .string({
      required_error: "Shop ID is required",
    })
    .min(1),
  displayTitle: z
    .string({
      required_error: "Display Title is required",
    })
    .min(1, "Display Title is required")
    .max(100, "Display Title must be under 100 characters"),
  ContactPhone: z
    .string({
      required_error: "Contact Phone is required",
    })
    .min(1, "Contact Phone is required"),
});