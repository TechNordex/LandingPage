import React from 'react'
import { STAGES } from '@/lib/types'
import { ClipboardList, Palette, Code2, FlaskConical, Eye, Rocket, CheckCircle2, Clock } from 'lucide-react'

// Map string icon names to actual Lucide components
const iconMap = {
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
    return (
        <div className="relative pt-4 pb-8">
            {/* Background Line */}
            <div className="absolute top-[34px] left-[10%] right-[10%] h-[2px] bg-border md:block hidden" />

            {/* Active Line */}
            <div
                className="absolute top-[34px] left-[10%] h-[2px] bg-primary md:block hidden transition-all duration-700 ease-in-out"
                style={{
                    width: `${Math.max(0, (currentStageId - 1) * (80 / (STAGES.length - 1)))}%`, // 80% is the distance between left 10% and right 10%
                }}
            />

            <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
                {STAGES.map((stage) => {
                    const isCompleted = stage.id < currentStageId
                    const isCurrent = stage.id === currentStageId
                    const isPending = stage.id > currentStageId
                    const IconComponent = iconMap[stage.icon as keyof typeof iconMap]

                    return (
                        <div key={stage.id} className="flex flex-row md:flex-col items-center md:flex-1 relative group">

                            {/* Vertical line for mobile */}
                            {stage.id !== STAGES.length && (
                                <div className="absolute left-[23px] top-[48px] bottom-[-32px] w-[2px] bg-border md:hidden" />
                            )}
                            {stage.id < currentStageId && stage.id !== STAGES.length && (
                                <div className="absolute left-[23px] top-[48px] bottom-[-32px] w-[2px] bg-primary md:hidden" />
                            )}

                            {/* Node Icon */}
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors duration-300 z-10
                  ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : ''}
                  ${isCurrent ? 'bg-background border-primary text-primary shadow-[0_0_15px_rgba(245,168,0,0.3)] animate-pulse' : ''}
                  ${isPending ? 'bg-background border-border text-muted-foreground' : ''}
                `}
                            >
                                {isCompleted ? <CheckCircle2 size={24} /> : <IconComponent size={24} />}
                            </div>

                            {/* Text / Label */}
                            <div className="ml-6 md:ml-0 md:mt-4 flex flex-col md:items-center w-full">
                                <span
                                    className={`text-sm font-semibold mb-1
                    ${isCurrent ? 'text-primary' : ''}
                    ${isCompleted ? 'text-foreground' : ''}
                    ${isPending ? 'text-muted-foreground' : ''}
                  `}
                                >
                                    Etapa {stage.id}: {stage.label}
                                </span>

                                {/* Mobile Description */}
                                <p className="text-xs text-muted-foreground md:hidden mt-1">{stage.desc}</p>

                                {/* Desktop Tooltip (Hover) */}
                                <div className="absolute top-full mt-2 bg-popover/90 backdrop-blur-sm border border-border text-popover-foreground text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block whitespace-nowrap z-20">
                                    {stage.desc}
                                </div>
                            </div>

                            {/* Badges for current/pending */}
                            {isCurrent && (
                                <div className="ml-auto md:hidden bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                    Atual
                                </div>
                            )}
                            {isPending && (
                                <div className="ml-auto md:hidden text-muted-foreground/50">
                                    <Clock size={16} />
                                </div>
                            )}

                        </div>
                    )
                })}
            </div>
        </div>
    )
}
