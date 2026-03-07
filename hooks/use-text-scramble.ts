"use client"

import { useCallback, useEffect, useState } from "react"

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+"

export function useTextScramble(
    target: string,
    { speed = 40, startDelay = 800, revealDuration = 1000 } = {}
) {
    const [text, setText] = useState("")
    const [isDone, setIsDone] = useState(false)

    const scramble = useCallback(async () => {
        if (!target) return

        let iteration = 0
        const maxIterations = target.length + 10

        const interval = setInterval(() => {
            setText((prev) =>
                target
                    .split("")
                    .map((char, index) => {
                        if (index < iteration) {
                            return target[index]
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)]
                    })
                    .join("")
            )

            if (iteration >= target.length) {
                clearInterval(interval)
                setIsDone(true)
            }

            iteration += 1 / 3 // Slower reveal for more scramble frames
        }, speed)

        return () => clearInterval(interval)
    }, [target, speed])

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>

        timeoutId = setTimeout(() => {
            scramble()
        }, startDelay)

        return () => clearTimeout(timeoutId)
    }, [scramble, startDelay])

    return { text, isDone }
}
