"use client"

import React, { useRef, useEffect } from "react"

interface MagneticWrapperProps {
    children: React.ReactElement<any>
    className?: string
    strength?: number
}

export function MagneticWrapper({ children, className = "", strength = 0.2 }: MagneticWrapperProps) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const node = ref.current
        if (!node) return

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e
            const { width, height, left, top } = node.getBoundingClientRect()
            const x = clientX - (left + width / 2)
            const y = clientY - (top + height / 2)

            if (node.firstElementChild) {
                ; (node.firstElementChild as HTMLElement).style.transform = `translate(${x * strength}px, ${y * strength}px)`
            }
        }

        const handleMouseLeave = () => {
            if (node.firstElementChild) {
                ; (node.firstElementChild as HTMLElement).style.transform = `translate(0px, 0px)`
            }
        }

        node.addEventListener("mousemove", handleMouseMove)
        node.addEventListener("mouseleave", handleMouseLeave)

        return () => {
            node.removeEventListener("mousemove", handleMouseMove)
            node.removeEventListener("mouseleave", handleMouseLeave)
        }
    }, [strength])

    return (
        <div ref={ref} className={className}>
            {React.cloneElement(children, {
                style: {
                    ...(children.props.style || {}),
                    transition: "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
                    willChange: "transform"
                }
            })}
        </div>
    )
}
