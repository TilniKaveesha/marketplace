import Image from "next/image";
import { Button } from "@/components/ui/button";
import HeroSection from"./_components/hero-section";
import ItemListing from "./_components/itemlisting-section";

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection/>
      <ItemListing/>
    </div>
  );
}
