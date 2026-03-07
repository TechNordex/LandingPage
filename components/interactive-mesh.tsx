"use client"
import { useEffect, useRef, useState } from "react"

export function InteractiveMesh() {
    const [mouseX, setMouseX] = useState(0)
    const [mouseY, setMouseY] = useState(0)
    const [mounted, setMounted] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Animação de entrada
        const timer = setTimeout(() => setMounted(true), 50)

        // Apenas aplica movimento do mouse em desktops
        if (window.matchMedia("(pointer: coarse)").matches) return

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return

            // Calculate normalized mouse position (-0.5 to 0.5)
            const x = (e.clientX / window.innerWidth) - 0.5
            const y = (e.clientY / window.innerHeight) - 0.5

            setMouseX(x)
            setMouseY(y)
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            clearTimeout(timer)
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 w-full h-full pointer-events-none z-[0] overflow-hidden"
        >
            {/* 
        Container that subtle shifts inversely to the mouse 
        to create a 3D parallax feel for the gradient blobs.
      */}
            <div
                className={`absolute inset-[-20%] w-[140%] h-[140%] transition-opacity duration-[3000ms] ${mounted ? "opacity-100" : "opacity-0"
                    }`}
                style={{
                    transform: `translate3d(${mouseX * -60}px, ${mouseY * -60}px, 0)`,
                    transition: "transform 2500ms cubic-bezier(0.22, 1, 0.36, 1), opacity 3000ms ease-out"
                }}
            >
                {/* Glowing Orb 1 - Top Right - Moves slowly based on CSS animation */}
                <div
                    className="absolute top-[5%] right-[15%] w-[50vw] h-[50vw] rounded-full blur-[120px] animate-[pulse_12s_ease-in-out_infinite] opacity-70"
                    style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 65%)" }}
                />

                {/* Glowing Orb 2 - Bottom Left */}
                <div
                    className="absolute bottom-[15%] left-[5%] w-[60vw] h-[60vw] rounded-full blur-[150px] animate-[pulse_18s_ease-in-out_infinite_reverse] opacity-50"
                    style={{ background: "radial-gradient(circle, var(--gold-light) 0%, transparent 75%)" }}
                />

                {/* Dynamic Highlight - Follows mouse directly but smoothed */}
                <div
                    className="absolute w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-40"
                    style={{
                        background: "radial-gradient(circle, var(--primary) 0%, transparent 55%)",
                        transform: `translate3d(calc(50vw + ${mouseX * 100}vw - 20vw), calc(50vh + ${mouseY * 100}vh - 20vw), 0)`,
                        transition: "transform 3500ms cubic-bezier(0.22, 1, 0.36, 1)"
                    }}
                />

                {/* 
          A clean noise / noise-texture overly can be added here if desired.
          Using a CSS grid gives structure to the fluid blobs.
        */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_10%,transparent_100%)]" />
            </div>
        </div>
    )
}
