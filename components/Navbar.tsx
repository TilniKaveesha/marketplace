"use client"

import type React from "react"
import { useCallback, useState } from "react"
import Link from "next/link"
import { Plus, Search, Menu, X, Loader, MessageSquareText, Bell, Settings } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import Logo from "./logo"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import useRegisterDialog from "@/hooks/use-register.dialog"
import useLoginDialog from "@/hooks/use-login.dialog"
import useCurrentUser from "@/hooks/api/use-current-user"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { logoutMutationFn } from "@/lib/fetcher"
import { toast } from "@/hooks/use-toast"

const Navbar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { onOpen: onRegisterOpen } = useRegisterDialog()
  const { onOpen: onLoginOpen } = useLoginDialog()
  const [searchKeyword, setSearchKeyword] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { data: userData, isPending: isLoading } = useCurrentUser()
  const user = userData?.user
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: logoutMutationFn,
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null)
      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      })
      router.push("/")
    },
    onError: () => {
      toast({
        title: "Logout Failed",
        description: "Please try again.",
      })
    },
  })

  const handleSell = () => {
    if (!user) {
      onLoginOpen()
      return
    }
    router.push("/my-shop/add-listing")
  }

  const handleLogout = useCallback(() => {
    mutate()
  }, [mutate])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchKeyword.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const isAdmin = user && (user.email === 'test2@gmail.com' || user.labels?.includes('admin'))

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md px-4 md:px-6 h-20 border-b border-gray-200/50">
      <nav className="flex items-center justify-between h-full max-w-7xl mx-auto">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Logo />
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center flex-1 mx-12 space-x-8">
          <motion.form
            onSubmit={handleSearch}
            className="w-full max-w-md"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative flex h-12 items-center bg-gray-50 rounded-xl px-4 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white focus-within:shadow-lg">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <Input
                type="search"
                name="keyword"
                autoComplete="off"
                placeholder="Search amazing products..."
                className="flex-1 border-none outline-none focus:ring-0 shadow-none bg-transparent text-gray-700 placeholder-gray-400"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                aria-label="Search products"
              />
              {searchKeyword && (
                <Button type="submit" size="sm" className="ml-2 h-8 px-3 bg-primary hover:bg-primary/90">
                  Search
                </Button>
              )}
            </div>
          </motion.form>

          <nav className="flex items-center space-x-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                Home
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link href="/search" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                Browse
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                About
              </Link>
            </motion.div>
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          {isLoading || isPending ? (
            <Loader className="w-5 h-5 animate-spin text-gray-500" />
          ) : user ? (
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => router.push("/profile-messages")}
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100 rounded-full"
              >
                <MessageSquareText className="w-5 h-5" />
              </Button>

              <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 rounded-full">
                <Bell className="w-5 h-5" />
              </Button>

              {isAdmin && (
                <Button
                  onClick={() => router.push("/admin")}
                  variant="outline"
                  size="sm"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                  <Badge variant="secondary" className="ml-2">
                    Admin
                  </Badge>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                    <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary to-purple-600 text-white">
                      {user?.name.charAt(0).toUpperCase()}
                      {user?.name.split(" ")[1]?.charAt(0).toUpperCase() || user?.name.charAt(1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => router.push("/my-shop")} className="cursor-pointer">
                    My Shop
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/orders")} className="cursor-pointer">
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={isPending} className="cursor-pointer text-red-600">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                variant="ghost"
                onClick={onLoginOpen}
                className="text-gray-700 hover:text-primary hover:bg-gray-50"
              >
                Sign In
              </Button>
              <Button
                onClick={onRegisterOpen}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
              </Button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-6 h-12 shadow-lg hover:shadow-xl transition-all"
              onClick={handleSell}
            >
              <Plus className="mr-2 w-5 h-5" />
              Sell Now
            </Button>
          </motion.div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="hover:bg-gray-100"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/50"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
              <form onSubmit={handleSearch}>
                <div className="relative flex h-12 items-center bg-gray-50 rounded-xl px-4">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <Input
                    type="search"
                    name="keyword"
                    autoComplete="off"
                    placeholder="Search products..."
                    className="flex-1 border-none outline-none focus:ring-0 shadow-none bg-transparent"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    aria-label="Search products"
                  />
                </div>
              </form>

              <nav className="space-y-4">
                <Link
                  href="/"
                  className="block text-lg font-medium text-gray-700 hover:text-primary"
                  onClick={toggleMobileMenu}
                >
                  Home
                </Link>
                <Link
                  href="/search"
                  className="block text-lg font-medium text-gray-700 hover:text-primary"
                  onClick={toggleMobileMenu}
                >
                  Browse
                </Link>
                {user ? (
                  <>
                    <Link
                      href="/my-shop"
                      className="block text-lg font-medium text-gray-700 hover:text-primary"
                      onClick={toggleMobileMenu}
                    >
                      My Shop
                    </Link>
                    <Link
                      href="/profile-messages"
                      className="block text-lg font-medium text-gray-700 hover:text-primary"
                      onClick={toggleMobileMenu}
                    >
                      Messages
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block text-lg font-medium text-purple-700 hover:text-purple-800"
                        onClick={toggleMobileMenu}
                      >
                        Admin Panel
                        <Badge variant="secondary" className="ml-2">
                          Admin
                        </Badge>
                      </Link>
                    )}
                    <button
                      className="block text-lg font-medium text-red-600 hover:text-red-700"
                      onClick={() => {
                        handleLogout()
                        toggleMobileMenu()
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => {
                        onLoginOpen()
                        toggleMobileMenu()
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-purple-600"
                      onClick={() => {
                        onRegisterOpen()
                        toggleMobileMenu()
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </nav>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3"
                onClick={() => {
                  handleSell()
                  toggleMobileMenu()
                }}
              >
                <Plus className="mr-2 w-5 h-5" />
                Sell Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
