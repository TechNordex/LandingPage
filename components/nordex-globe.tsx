"use client"

import Image from "next/image"
import { Globe } from "@/components/ui/globe"

export function NordexGlobe() {
  return (
    <div className="relative flex items-center justify-center w-full h-full aspect-square">
      {/* Globe Animation */}
      <div className="absolute inset-0 z-0">
        <Globe className="w-full h-full" />
      </div>

      {/* Floating Logo - Centered and professional */}
      <div className="relative z-10 w-[95%] aspect-square flex items-center justify-center animate-pulse-slow">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Nordex-Tech-remove-WSehNqsem3EZQ2jxpk0CKTKMU1hLtG.png"
          alt="Nordex Tech Logo"
          width={320}
          height={320}
          className="object-contain drop-shadow-[0_0_20px_rgba(251,189,35,0.4)]"
          priority
        />
      </div>
      
      {/* Subtle glow behind the logo - reduced opacity to keep continents clear */}
      <div className="absolute inset-0 bg-radial-gradient from-primary/5 to-transparent opacity-30 z-5 pointer-events-none" />
    </div>
  )
}
