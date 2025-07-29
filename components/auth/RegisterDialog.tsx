"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { signupSchema } from "@/validation/auth.validation"
import { zodResolver } from "@hookform/resolvers/zod"
import type * as z from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader, Eye, EyeOff, User, Mail, Store, Phone, CreditCard, UserPlus } from "lucide-react"
import useRegisterDialog from "@/hooks/use-register.dialog"
import useLoginDialog from "@/hooks/use-login.dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { RegisterMutationFn } from "@/lib/fetcher"
import { toast } from "@/hooks/use-toast"

const RegisterDialog = () => {
  const { open, onClose } = useRegisterDialog()
  const { onOpen } = useLoginDialog()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: RegisterMutationFn,
  })

  const [showPassword, setShowPassword] = useState(false)

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
  })

  const onSubmit = (values: z.infer<typeof signupSchema>) => {
    mutate(values, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["currentUser"],
        })
        toast({
          title: "Welcome to MarketMaster! 🎉",
          description: "Your account has been created successfully",
          variant: "success",
        })
        form.reset()
        onClose()
      },
      onError: (err: any) => {
        toast({
          title: "Registration failed",
          description: "Please check your information and try again",
          variant: "destructive",
        })
      },
    })
  }

  const handleLoginOpen = () => {
    onClose()
    onOpen()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] p-0 bg-white border-0 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogHeader className="text-center space-y-2">
              <DialogTitle className="text-2xl font-bold text-white">Join MarketMaster Today!</DialogTitle>
              <DialogDescription className="text-blue-100">
                Create your account and start selling amazing products
              </DialogDescription>
            </DialogHeader>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
        </div>

        {/* Form content */}
        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          placeholder="Enter your full name"
                          className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                          {...field}
                        />
                      </div>
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
                    <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          placeholder="Enter your email"
                          type="email"
                          className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                          {...field}
                        />
                      </div>
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
                    <FormLabel className="text-gray-700 font-medium">Shop Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          placeholder="Enter your shop name"
                          className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                          {...field}
                        />
                      </div>
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
                    <FormLabel className="text-gray-700 font-medium">Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          placeholder="Enter your phone number"
                          className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                          {...field}
                        />
                      </div>
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
                    <FormLabel className="text-gray-700 font-medium">ID Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          placeholder="Enter your ID number"
                          className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                          {...field}
                        />
                      </div>
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
                    <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Create a strong password"
                          type={showPassword ? "text" : "password"}
                          className="pl-4 pr-12 h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 h-8 w-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                size="lg"
                disabled={isPending}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                type="submit"
              >
                {isPending ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-300"
                    onClick={handleLoginOpen}
                  >
                    Sign in instead
                  </button>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RegisterDialog
