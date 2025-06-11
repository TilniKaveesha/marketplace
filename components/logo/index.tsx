import { CarFrontIcon, Dot, Smile } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
  <div className="relative size-7 bg-black rounded-full flex items-center justify-center">
    <Smile className="w-5 h-5 text-primary" />
    <span className="absolute -bottom-3 -right-2 text-gray-700">
      <Dot />
    </span>
  </div>
  <span className="font-semibold text-base  text-black/95">
    Community Shop
  </span>
</Link>

  )
}

export default Logo;