"use client";
import { listingSchema } from "@/validation/listing.validation";
import React from "react";
import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  AVAILABILITY_OPTIONS,
  CATEGORY_OPTIONS,
  MODEL_OPTIONS,
  PRICE_RANGE_OPTIONS,
} from "@/constant/item-options";
import FileUploader from "@/components/FileUploader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { addListingFields } from "@/constant/listing-fields";
import FormGenerator from "@/components/FormGenerator";
import { Button } from "@/components/ui/button";
import { Loader, X } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import useCurrentUser from "@/hooks/api/use-current-user";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { addListingMutationFn } from "@/lib/fetcher";

const Addlisting = () => {
  const router = useRouter();
  const { data } = useCurrentUser();
  const shop = data?.shop;

  const { mutate, isPending } = useMutation({
    mutationFn: addListingMutationFn,
  });

  const listingClientSchema = listingSchema.extend({
    ContactPhone: z
      .string({ required_error: "Contact number is required" })
      .refine(isValidPhoneNumber, "Invalid phone number"),
    imageUrls: z
      .array(z.string())
      .min(3, "Add at least 3 photos for this listing"),
  });

  type FormDataType = z.infer<typeof listingClientSchema>;
  type FormFieldName = keyof FormDataType;

  const form = useForm<FormDataType>({
    resolver: zodResolver(listingClientSchema),
    mode: "onBlur",
    defaultValues: {
      category: "",
      condition: "",
      availability: "",
      priceRange: "",
      model: "",
      type: "",
      description: "",
      price: 0,
      ContactPhone: "",
      imageUrls: [],
    },
  });

  const imageUrls = useWatch({
    control: form.control,
    name: "imageUrls",
  });

  const category = useWatch({
    control: form.control,
    name: "category",
  });

  const handleImageUrls = (imageUrls: string[]) => {
    form.setValue("imageUrls", [...form.getValues().imageUrls, ...imageUrls]);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImageUrls = [...form.getValues().imageUrls];
    updatedImageUrls.splice(index, 1);
    form.setValue("imageUrls", updatedImageUrls);
  };

  const getLabel = (
    value: string,
    options: { value: string; label: string }[]
  ) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  const onSubmit = (values: FormDataType) => {
    console.log("Submitting...", values);
    console.log("Form values:", values);
    console.log("Form errors:", form.formState.errors);

    if (!shop?.$id) {
      toast({
        title: "Shop not found",
        description: "Please try again later.",
        variant: "destructive",
      });
      return;
    }

    const { category, condition, availability, priceRange, model } = values;
    const displayTitle = [
      condition === "Brand_new" ? "New" : null,
      getLabel(model, MODEL_OPTIONS),
      getLabel(availability, AVAILABILITY_OPTIONS),
    ]
      .filter(Boolean)
      .join(" ");

    const payload = {
      ...values,
      displayTitle,
      shopId: shop.$id,
    };

    console.log("Submitting payload:", payload);

    mutate(payload, {
      onSuccess: () => {
        console.log("Mutation success:", data);
        toast({
          title: "Listing added successfully",
          description: "Your listing is now live on the platform",
          variant: "success",
        });
        router.push("/my-shop");
      },
      onError: (error) => {
        console.error("Mutation error:", error);
        toast({
          title: "Something went wrong",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <main className="container mx-auto px-4 pt-3 pb-8">
      <div className="max-w-4xl mx-auto pt-5">
        <Card className="!bg-transparent shadow-none border-none text-black">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Add New Listing</CardTitle>
          </CardHeader>
          <CardContent className="bg-white rounded-[8px] p-4 px-6 pb-8">
            <div className="flex items-center">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                  {/* image uploader with validation */}
                  <FormField
                    control={form.control}
                    name="imageUrls"
                    render={() => (
                      <FormItem>
                        <h2 className="text-sm font-medium text-[#28363e]">Add Photo</h2>
                        <div className="text-sm text-[#6c8ea0]">
                          <div>Add at least 3 photos for this listing</div>
                          First picture is the title picture.
                        </div>
                        <div className="flex items-center justify-start mt-2">
                          <FileUploader onFileUrlsReceived={handleImageUrls}>
                            <ScrollArea className="w-96 whitespace-nowrap ml-3">
                              <div className="flex space-x-4 items-center h-20">
                                {imageUrls?.map((imageUrl: string, index: number) => (
                                  <div
                                    key={`id-${index}`}
                                    className="relative overflow-hidden w-20 h-20 rounded-[8px] bg-[#e5f6e8]"
                                  >
                                    <img
                                      src={imageUrl}
                                      alt=""
                                      className="w-full h-full rounded-[8px] object-cover"
                                    />
                                    <button
                                      onClick={() => handleRemoveImage(index)}
                                      className="absolute top-0 right-0 p-1 bg-black rounded-full"
                                    >
                                      <X className="w-4 h-4 text-white" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                          </FileUploader>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dynamic form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-5">
                    {addListingFields.map((field, index) => {
                      if (field.name === "model") {
                        const filteredModels = MODEL_OPTIONS.filter(
                          (model) => model.key === category
                        );
                        field.options = filteredModels;
                        field.disabled = !category;
                      }

                      return (
                        <FormField
                          key={index}
                          control={form.control}
                          name={field.name as FormFieldName}
                          disabled={field.disabled || isPending}
                          render={({ field: formField }) => {
                            const valueMultiSelect =
                              field.fieldType === "multiselect" &&
                              Array.isArray(formField.value)
                                ? formField.value
                                : [];

                            return (
                              <FormItem
                                className={`${
                                  field.col ? `col-span-${field.col}` : ""
                                }`}
                              >
                                <FormControl>
                                  <FormGenerator
                                    field={field}
                                    register={form.register}
                                    errors={form.formState.errors}
                                    formValue={formField.value}
                                    valueMultiSelect={valueMultiSelect}
                                    onChange={(value) => {
                                      formField.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      );
                    })}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="mt-6 py-6 mb-4 w-full max-w-xs flex place-items-center justify-self-center"
                    disabled={isPending}
                  >
                    {isPending && <Loader className="w-4 h-4 animate-spin mr-2" />}
                    Post Listing
                  </Button>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Addlisting;