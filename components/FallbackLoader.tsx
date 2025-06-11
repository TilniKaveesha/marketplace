"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function FallbackLoader() {
  return (
    <motion.div
      className="flex h-screen items-center justify-center bg-[#EBF2F7]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <motion.p
          className="text-sm text-gray-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Loading, please wait...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
