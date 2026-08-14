import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { gradeColor } from '@/lib/aion2'

/** 아이템/스킬 아이콘. 등급 색으로 테두리를 준다. */
export function GameIcon({
  src,
  grade,
  size = 44,
  alt = '',
  className,
}: {
  src?: string
  grade?: string
  size?: number
  alt?: string
  className?: string
}) {
  const color = gradeColor(grade)
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/40',
        className,
      )}
      style={{ width: size, height: size, boxShadow: `inset 0 0 0 1.5px ${color}55` }}
    >
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-contain" />
      ) : (
        <span className="text-[13px] opacity-40">❔</span>
      )}
    </span>
  )
}

export function GradeText({
  grade,
  children,
  className,
}: {
  grade?: string
  children: ReactNode
  className?: string
}) {
  return (
    <span className={className} style={{ color: gradeColor(grade) }}>
      {children}
    </span>
  )
}

export function Section({
  emoji,
  title,
  right,
  children,
  className,
}: {
  emoji: string
  title: string
  right?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="flex items-center gap-1.5 text-[15px] font-semibold tracking-tight">
          <span aria-hidden>{emoji}</span>
          {title}
        </h2>
        {right}
      </div>
      {children}
    </section>
  )
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border/70 bg-card p-3.5', className)}>
      {children}
    </div>
  )
}

export function EmptyState({
  emoji,
  title,
  desc,
}: {
  emoji: string
  title: string
  desc?: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <span className="text-4xl" aria-hidden>
        {emoji}
      </span>
      <p className="text-sm font-medium">{title}</p>
      {desc ? <p className="text-xs text-muted-foreground">{desc}</p> : null}
    </div>
  )
}

/** 바텀시트 상단 손잡이 */
export function SheetHandle() {
  return <span className="mx-auto mt-1 h-1 w-10 shrink-0 rounded-full bg-white/20" />
}

/** 강화 수치 뱃지: +20 / 5돌 */
export function EnchantBadge({
  enchantLevel,
  exceedLevel,
}: {
  enchantLevel: number
  exceedLevel: number
}) {
  if (!enchantLevel && !exceedLevel) return null
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold">
      {enchantLevel ? <span className="text-primary">+{enchantLevel}</span> : null}
      {exceedLevel ? (
        <span className="rounded bg-rose-500/15 px-1 py-px text-rose-300">{exceedLevel}돌</span>
      ) : null}
    </span>
  )
}
