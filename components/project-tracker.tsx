/**
 * Project Tracker - Vertical Stepper
 * -------------------------------------------
 * - Vertical layout so stage names are never clipped
 * - Animated progress line and step markers with stagger
 * - Gold + dark palette, minimal and premium feel
 */
'use client'
import React, { useEffect, useState } from 'react'
import { STAGES } from '@/lib/types'
import { ClipboardList, Palette, Code2, FlaskConical, Eye, Rocket, Check } from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
    ClipboardList,
    Palette,
    Code2,
    FlaskConical,
    Eye,
    Rocket
}

interface ProjectTrackerProps {
    currentStageId: number
}

export function ProjectTracker({ currentStageId }: ProjectTrackerProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // Small delay to trigger stagger animations on mount
        const t = setTimeout(() => setMounted(true), 50)
        return () => clearTimeout(t)
    }, [])

    return (
        <div className="flex flex-col gap-0 w-full">
            {STAGES.map((stage, idx) => {
                const isCompleted = stage.id < currentStageId
                const isCurrent = stage.id === currentStageId
                const isPending = stage.id > currentStageId
                const IconComponent = iconMap[stage.icon] as React.ComponentType<{ size?: number }>

                const isLast = idx === STAGES.length - 1

                return (
                    <div
                        key={stage.id}
                        className="relative flex items-start gap-4"
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
                            transition: `opacity 0.4s ease ${idx * 80}ms, transform 0.4s ease ${idx * 80}ms`,
                        }}
                    >
                        {/* Left column: node + vertical connector */}
                        <div className="flex flex-col items-center shrink-0">
                            {/* Node */}
                            <div
                                className={[
                                    'w-9 h-9 rounded-full flex items-center justify-center border-[1.5px] z-10 transition-all duration-500 shrink-0',
                                    isCompleted
                                        ? 'bg-primary border-primary text-black'
                                        : isCurrent
                                        ? 'bg-card border-primary text-primary shadow-[0_0_14px_rgba(245,168,0,0.3)]'
                                        : 'bg-background border-border text-muted-foreground/30',
                                ].join(' ')}
                            >
                                {isCompleted ? (
                                    <Check size={16} strokeWidth={2.5} />
                                ) : (
                                    <IconComponent size={15} />
                                )}
                            </div>

                            {/* Vertical connector line */}
                            {!isLast && (
                                <div className="w-px flex-1 min-h-[28px] mt-1 relative overflow-hidden">
                                    {/* Track */}
                                    <div className="absolute inset-0 bg-border/50" />
                                    {/* Active fill */}
                                    <div
                                        className="absolute top-0 left-0 right-0 bg-primary transition-all duration-700 ease-out"
                                        style={{
                                            height: isCompleted ? '100%' : '0%',
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Right column: text content */}
                        <div className={`pb-7 ${isLast ? 'pb-0' : ''}`}>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span
                                    className={[
                                        'text-[13px] font-semibold leading-tight transition-colors duration-300',
                                        isCompleted
                                            ? 'text-foreground/70'
                                            : isCurrent
                                            ? 'text-foreground'
                                            : 'text-muted-foreground/40',
                                    ].join(' ')}
                                >
                                    {stage.label}
                                </span>

                                {isCurrent && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-sm">
                                        <span className="w-1 h-1 rounded-full bg-primary animate-pulse inline-block" />
                                        ATUAL
                                    </span>
                                )}
                                {isCompleted && (
                                    <span className="text-[9px] font-bold uppercase tracking-wide text-green-500/70">
                                        ✓
                                    </span>
                                )}
                            </div>
                            <p
                                className={[
                                    'text-[11px] leading-snug transition-colors duration-300',
                                    isCurrent
                                        ? 'text-muted-foreground/70'
                                        : isCompleted
                                        ? 'text-muted-foreground/40'
                                        : 'text-muted-foreground/20',
                                ].join(' ')}
                            >
                                {stage.desc}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
