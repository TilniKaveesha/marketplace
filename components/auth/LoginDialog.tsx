"use client";
import React, { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import useLoginDialog from "@/hooks/use-login.dialog";
import useRegisterDialog from "@/hooks/use-register.dialog";
import { loginSchema } from "@/validation/auth.validation";
import { loginMutationFn } from "@/lib/fetcher";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader } from "lucide-react";

const LoginDialog = () => {
  const { open, onClose } = useLoginDialog();
  const { onOpen } = useRegisterDialog();

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: loginMutationFn,
  });

  //const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    mutate(values, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["currentUser"],
        });

        toast({
          title: "Login Successfully",
          description: "You have been logged in successfully",
          variant: "success",
        });
        form.reset();
        onClose();
      },
      onError: () => {
        toast({
          title: "Error occurred",
          description: "Login failed, please try again",
          variant: "destructive",
        });
      },
    });
  };

  const handleRegisterOpen = () => {
    onClose();
    onOpen();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-8 bg-white text-gray-800">
  <DialogHeader>
    <DialogTitle>Sign in to your account</DialogTitle>
    <DialogDescription className="text-gray-800">
      Enter your email and password below to Login
    </DialogDescription>
  </DialogHeader>

  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">

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
                className="!h-10 placeholder:text-gray-500"
                aria-label="Email address"
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
          className="w-full bg-black hover:bg-gray-700 text-white"
          type="submit"
        >
          {isPending && (
            <Loader className="w-4 h-4 animate-spin mr-2" />
          )}
          Login
        </Button>
        <Button
          size="lg"
          variant="outline"
          type="button"
          onClick={() => setIsOpen(false)}
          disabled={isPending}
          className="w-full bg-gray-300 hover:bg-gray-500 text-black"
        >
          Cancel
        </Button>
      </div>
    </form>
  </Form>

  {/* Login Redirect */}
  <div className="mt-2 flex items-center justify-center">
    <p className="text-sm text-gray-600">
      Don't have an account?{" "}
      <button className="text-black underline" onClick={handleRegisterOpen}>
        Registration
      </button>
    </p>
  </div>
</DialogContent>

    </Dialog>
  );
};

export default LoginDialog;
