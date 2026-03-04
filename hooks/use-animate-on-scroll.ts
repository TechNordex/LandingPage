/**
 * useAnimateOnScroll
 * ------------------
 * Returns a ref to attach to any element.
 * When the element enters the viewport, the class `is-visible` is added,
 * which triggers CSS animations defined in globals.css.
 */
"use client"

import { useEffect, useRef } from "react"

interface Options {
  /** Fraction of the element that must be visible before triggering (0–1). Default: 0.15 */
  threshold?: number
  /** Only trigger once (default: true) */
  once?: boolean
}

export function useAnimateOnScroll<T extends HTMLElement = HTMLDivElement>(
  options: Options = {}
) {
  const { threshold = 0.15, once = true } = options
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible")
          if (once) observer.unobserve(el)
        } else if (!once) {
          el.classList.remove("is-visible")
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  return ref
}
