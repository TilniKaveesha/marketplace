"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { Plus, Search, Menu, X, Loader, MessageSquareText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./logo";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import useRegisterDialog from "@/hooks/use-register.dialog";
import useLoginDialog from "@/hooks/use-login.dialog";
import useCurrentUser from "@/hooks/api/use-current-user";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutMutationFn } from "@/lib/fetcher";
import { toast } from "@/hooks/use-toast";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { onOpen: onRegisterOpen } = useRegisterDialog();
  const { onOpen: onLoginOpen } = useLoginDialog();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: userData, isPending: isLoading } = useCurrentUser();
  const user = userData?.user;
  const hideSearchPathname = ["/", "/my-shop/add-listing", "/profile-messages"];
  const hideNavPath = ["/my-shop", "/my-shop/add-listing", "/profile-messages"];
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: logoutMutationFn,
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      });
      router.push("/");
    },
    onError: () => {
      toast({
        title: "Logout Failed",
        description: "Please try again.",
      });
    },
  });

  const handleSell = () => {
    if (!user) {
      onLoginOpen();
      return;
    }
    router.push("/my-shop/add-listing"); // Fixed typo in path
  };

  const handleLogout = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Searching for:", searchKeyword);
    // Route to search page or call API here
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Animation variants for mobile menu
  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <header
      className="sticky top-0 z-50 w-full bg-gray-100 px-4 md:px-6 h-16 backdrop-blur-sm"
      style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)" }}
    >
      <nav className="flex items-center justify-between h-full max-w-7xl mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo />
        </motion.div>

        {/* Navigation and Search */}
        <div className="hidden lg:flex items-center justify-center flex-1 mx-9 space-x-6 text-black">
          <motion.form
            onSubmit={handleSearch}
            className="w-full max-w-[320px]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative flex h-10 items-center bg-white/90 rounded-lg px-3 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary text-black">
              <Input
                type="search"
                name="keyword"
                autoComplete="off"
                placeholder="Search products..."
                className="flex-1 border-none outline-none focus:ring-0 shadow-none text-black placeholder-black"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                aria-label="Search products"
              />
              <button type="submit" aria-label="Submit search">
                <Search className="w-5 h-5 text-gray-600 hover:text-primary transition-colors" />
              </button>
            </div>
          </motion.form>

          <ul className="flex items-center space-x-6">
            <motion.li
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </Link>
            </motion.li>
            <motion.li
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm font-medium hover:text-primary transition-colors">
                  Categories & Services
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-black rounded-lg shadow-lg">
                  <DropdownMenuItem asChild>
                    <Link href="/categories/electronics" className="block px-4 py-2 hover:bg-gray-500">
                      Electronics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/categories/clothing" className="block px-4 py-2 hover:bg-gray-500">
                      Clothing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/categories/services" className="block px-4 py-2 hover:bg-gray-500">
                      Services
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.li>
            <motion.li
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </Link>
            </motion.li>
          </ul>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          {isLoading || isPending ? (
            <Loader className="w-5 h-5 animate-spin text-white" />
          ) : user ? (
            <>
              <Button onClick={() => router.push("/profile-messages")} size="icon" className="rounded-full shadow-md !py-0 !bg-white !text-black">
                <MessageSquareText />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar role="button" className="h-9 w-9 shadow-sm">
                    <AvatarFallback className="text-sm uppercase">
                      {user?.name.charAt(0)}
                      {user?.name.charAt(1)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem
                    onClick={() => router.push("/my-shop")}
                    className="!cursor-pointer"
                  >
                    My Shop
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isPending}
                    className="!cursor-pointer"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <motion.div
              className="flex items-center space-x-2 text-black"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <button className="text-sm font-light hover:text-primary transition-colors" onClick={onLoginOpen}>
                Sign In
              </button>
              <Separator orientation="vertical" className="h-3 bg-white/50" />
              <button
                onClick={onRegisterOpen}
                className="text-sm font-light hover:text-primary transition-colors"
              >
                Register
              </button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Button
              size="default"
              className="bg-primary hover:bg-primary/90 text-gray-900 font-semibold px-5 h-10"
              onClick={handleSell}
            >
              <Plus className="mr-1 w-4 h-4" />
              Sell a Product
            </Button>
          </motion.div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden bg-white/95 backdrop-blur-sm border-t border-white/20"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="max-w-7xl mx-auto px-4 py-4">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative flex h-10 items-center bg-white/90 rounded-lg px-3">
                  <Input
                    type="search"
                    name="keyword"
                    autoComplete="off"
                    placeholder="Search products..."
                    className="flex-1 border-none outline-none focus:ring-0 shadow-none text-black placeholder-gray-900"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    aria-label="Search products"
                  />
                  <button type="submit" aria-label="Submit search">
                    <Search className="w-5 h-5 text-gray-900 hover:text-primary" />
                  </button>
                </div>
              </form>
              <ul className="flex flex-col space-y-4 text-black/95">
                <li>
                  <Link
                    href="/"
                    className="text-sm font-medium hover:text-primary"
                    onClick={toggleMobileMenu}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="text-sm font-medium hover:text-primary">
                      Categories & Services
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white text-black rounded-lg shadow-lg">
                      <DropdownMenuItem asChild>
                        <Link
                          href="/categories/electronics"
                          className="block px-4 py-2 hover:bg-gray-500"
                          onClick={toggleMobileMenu}
                        >
                          Electronics
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/categories/clothing"
                          className="block px-4 py-2 hover:bg-gray-500"
                          onClick={toggleMobileMenu}
                        >
                          Clothing
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/categories/services"
                          className="block px-4 py-2 hover:bg-gray-500"
                          onClick={toggleMobileMenu}
                        >
                          Services
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm font-medium hover:text-primary"
                    onClick={toggleMobileMenu}
                  >
                    Pricing
                  </Link>
                </li>
                {user ? (
                  <>
                    <li>
                      <Link
                        href="/my-shop"
                        className="text-sm font-medium hover:text-primary"
                        onClick={toggleMobileMenu}
                      >
                        My Shop
                      </Link>
                    </li>
                    <li>
                      <button
                        className="text-sm font-medium hover:text-primary"
                        onClick={() => {
                          handleLogout();
                          toggleMobileMenu();
                        }}
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <button
                        className="text-sm font-light hover:text-primary"
                        onClick={() => {
                          onLoginOpen();
                          toggleMobileMenu();
                        }}
                      >
                        Sign In
                      </button>
                    </li>
                    <li>
                      <button
                        className="text-sm font-light hover:text-primary"
                        onClick={() => {
                          onRegisterOpen();
                          toggleMobileMenu();
                        }}
                      >
                        Register
                      </button>
                    </li>
                  </>
                )}
                <li>
                  <Button
                    size="default"
                    className="w-full bg-primary hover:bg-primary/90 text-black/95 font-semibold px-5 h-10"
                    onClick={() => {
                      handleSell();
                      toggleMobileMenu();
                    }}
                  >
                    <Plus className="mr-1 w-4 h-4" />
                    Sell a Product
                  </Button>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;