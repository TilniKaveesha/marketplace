"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";
import HeroFilter from "./_common/hero-filter";

const HeroSection = () => {
  const sectionRef = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 50]); // Parallax effect for background

  // Tagline animation variants
  const taglineVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[700px] flex items-center justify-center px-4 md:px-10 py-16 overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <Image
          src="/images/hero-item.png"
          alt="Marketplace Background"
          fill
          className="object-cover brightness-[1.0]" // Adjusted for light theme
          priority
        />
      </motion.div>

      {/* Glass Content */}
      <div className="relative z-10 max-w-7xl w-full flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
        {/* Left Content with Light Glass Effect */}
        <motion.div
          className="flex-1 w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="backdrop-blur-md bg-white/60 border border-white rounded-2xl p-10 shadow-lg text-center lg:text-left">
            <motion.h1
              className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 mb-6" // Changed to dark text
              variants={taglineVariants}
              initial="hidden"
              animate="visible"
            >
              Revolutionize the Way You <br />
              <span className="text-gray-500">Buy & Sell Locally</span>
            </motion.h1>
            <motion.p
              className="text-gray-600/95 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0" // Changed to darker gray
              variants={taglineVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              Welcome to <span className="font-semibold text-gray-900">Community Shop</span> — the future of neighborhood commerce, now more modern and trustworthy than ever.
            </motion.p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <HeroFilter />
            </div> 
          </div>  
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;