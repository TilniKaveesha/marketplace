"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { signupSchema } from "@/validation/auth.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Eye, EyeOff } from "lucide-react";
import useRegisterDialog from "@/hooks/use-register.dialog";
import useLoginDialog from "@/hooks/use-login.dialog";
 import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RegisterMutationFn } from "@/lib/fetcher";
import { toast } from "@/hooks/use-toast";

const RegisterDialog = () => {
  const { open, onClose } = useRegisterDialog();
  const { onOpen } = useLoginDialog();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: RegisterMutationFn,
  });

  //const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      shopName: "",
      phone: "",
      idNumber: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof signupSchema>) => {
    mutate(values, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["currentUser"],
        });
        toast({
          title: "Registration successful",
          description: "",
          variant: "success",
        });
        form.reset();
        onClose();
      },
      onError: (err:any) => {
        toast({
          title: "Error occurred",
          description: "Registration failed. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handleLoginOpen = () => {
    onClose();
    onOpen();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-8  bg-white text-gray-800">
        <DialogHeader>
          <DialogTitle>Create an Account</DialogTitle>
          <DialogDescription className="text-gray-800">
            Enter your details below to register for an account
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Smith"
                      className="!h-10  placeholder:text-gray-500"
                      aria-label="Full name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="mail@example.com"
                      type="email"
                      className="!h-10  placeholder:text-gray-500"
                      aria-label="Email address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Shop Name */}
            <FormField
              control={form.control}
              name="shopName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ABCshop"
                      className="!h-10  placeholder:text-gray-500"
                      aria-label="Shop name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+12345678901"
                      className="!h-10  placeholder:text-gray-500"
                      aria-label="Phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ID Number */}
            <FormField
              control={form.control}
              name="idNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ABC123456"
                      className="!h-10  placeholder:text-gray-500"
                      aria-label="ID number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="********"
                        type={showPassword ? "text" : "password"}
                        className="!h-10  placeholder:text-gray-500"
                        aria-label="Password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                size="lg"
                disabled={isPending}
                className="w-full bg-primary bg-black hover:bg-gray-700 text-white"
                type="submit"
              >
                {isPending && (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                )}
                Register
              </Button>
              <Button
                size="lg"
                variant="outline"
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="w-full  bg-gray-300 hover:bg-gray-500 text-black"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>

        {/* Login Redirect */}
        <div className="mt-2 flex items-center justify-center">
          <p className="text-sm text-muted-foreground  text-gray-800">
            Already have an account?{" "}
            <button className="underline text-black" onClick={handleLoginOpen}>
              Sign in
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;
