/**
 * AnimateOnScroll
 * ---------------
 * Wrapper component that applies scroll-triggered animations.
 *
 * Usage:
 *   <AnimateOnScroll animation="fade-up" delay={100}>
 *     <YourComponent />
 *   </AnimateOnScroll>
 *
 * Available animations (defined in globals.css):
 *   "fade-up" | "fade-in" | "slide-left" | "slide-right"
 */
"use client"

import { useAnimateOnScroll } from "@/hooks/use-animate-on-scroll"

type Animation = "fade-up" | "fade-in" | "slide-left" | "slide-right"

interface AnimateOnScrollProps {
    children: React.ReactNode
    /** CSS animation variant */
    animation?: Animation
    /** Delay in milliseconds before animation starts */
    delay?: number
    /** Custom className to merge */
    className?: string
    /** Intersection threshold (0–1). Default: 0.15 */
    threshold?: number
}

export function AnimateOnScroll({
    children,
    animation = "fade-up",
    delay = 0,
    className = "",
    threshold,
}: AnimateOnScrollProps) {
    const ref = useAnimateOnScroll<HTMLDivElement>({ threshold })

    return (
        <div
            ref={ref}
            className={`animate-on-scroll anim-${animation} ${className}`}
            style={delay ? { animationDelay: `${delay}ms` } : undefined}
        >
            {children}
        </div>
    )
}
