import { useEffect, useState } from 'react'
import { getItemDetail } from '@/lib/api'
import type { EquipItem, ItemDetail } from '@/lib/aion2'
import { EQUIP_GROUPS, gradeColor, slotLabel } from '@/lib/aion2'
import { EnchantBadge, GameIcon, Panel, Section, SheetHandle } from '@/components/common'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'

interface Target {
  characterId: string
  serverId: number
}

export function EquipmentSection({
  items,
  target,
}: {
  items: EquipItem[]
  target: Target
}) {
  const [selected, setSelected] = useState<EquipItem | null>(null)
  const bySlot = new Map(items.map((i) => [i.slotPosName, i]))

  return (
    <>
      <div className="flex flex-col gap-6">
        {EQUIP_GROUPS.map((group) => {
          const rows = group.slots.map((s) => bySlot.get(s)).filter(Boolean) as EquipItem[]
          if (rows.length === 0) return null
          return (
            <Section
              key={group.key}
              emoji={group.emoji}
              title={group.label}
              right={<span className="text-xs text-muted-foreground">{rows.length}</span>}
            >
              <Panel className="divide-y divide-border/60 p-0">
                {rows.map((item) => (
                  <EquipRow key={item.slotPos} item={item} onClick={() => setSelected(item)} />
                ))}
              </Panel>
            </Section>
          )
        })}
      </div>

      <ItemSheet item={selected} target={target} onClose={() => setSelected(null)} />
    </>
  )
}

function EquipRow({ item, onClick }: { item: EquipItem; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors active:bg-accent/50"
    >
      <GameIcon src={item.icon} grade={item.grade} size={42} alt={item.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="rounded bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">
            {slotLabel(item.slotPosName)}
          </span>
          <EnchantBadge enchantLevel={item.enchantLevel} exceedLevel={item.exceedLevel} />
        </div>
        <p
          className="mt-0.5 truncate text-[13.5px] font-medium"
          style={{ color: gradeColor(item.grade) }}
        >
          {item.name}
        </p>
      </div>
      <span className="text-xs text-muted-foreground" aria-hidden>
        ›
      </span>
    </button>
  )
}

function ItemSheet({
  item,
  target,
  onClose,
}: {
  item: EquipItem | null
  target: Target
  onClose: () => void
}) {
  const [detail, setDetail] = useState<ItemDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // 닫히는 애니메이션 동안 내용이 사라지지 않도록 마지막 아이템을 붙잡아 둔다.
  const [shown, setShown] = useState<EquipItem | null>(null)

  useEffect(() => {
    if (item) setShown(item)
  }, [item])

  useEffect(() => {
    if (!item) return
    let alive = true
    setDetail(null)
    setError(null)
    setLoading(true)
    getItemDetail({
      id: item.id,
      enchantLevel: item.enchantLevel,
      characterId: target.characterId,
      serverId: target.serverId,
      slotPos: item.slotPos,
    })
      .then((d) => alive && setDetail(d))
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [item, target.characterId, target.serverId])

  return (
    <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-h-[85dvh] max-w-[520px] overflow-y-auto rounded-t-3xl px-4 pb-8"
      >
        <SheetHandle />
        {shown ? (
          <SheetHeader className="gap-3 px-0 pt-0">
            <div className="flex items-center gap-3">
              <GameIcon src={shown.icon} grade={shown.grade} size={54} alt={shown.name} />
              <div className="min-w-0">
                <SheetTitle
                  className="truncate text-base"
                  style={{ color: gradeColor(shown.grade) }}
                >
                  {shown.name}
                </SheetTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {slotLabel(shown.slotPosName)}
                  {detail ? ` · ${detail.gradeName} · ${detail.categoryName}` : ''}
                  {shown.enchantLevel ? ` · +${shown.enchantLevel}` : ''}
                  {shown.exceedLevel ? ` · ${shown.exceedLevel}돌` : ''}
                </p>
              </div>
            </div>
          </SheetHeader>
        ) : null}

        {loading ? (
          <div className="flex flex-col gap-2 pt-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : null}

        {error ? <p className="py-8 text-center text-sm text-muted-foreground">😵 {error}</p> : null}

        {detail ? (
          <div className="flex flex-col gap-4 pt-1">
            {detail.mainStats?.length ? (
              <StatBlock emoji="📊" title="기본 옵션">
                {detail.mainStats.map((s, i) => (
                  <li key={`${s.id}-${i}`} className="flex items-baseline justify-between gap-2">
                    <span className="text-muted-foreground">{s.name}</span>
                    <span className="font-medium tabular-nums">
                      {s.value}
                      {s.extra && s.extra !== '0' && s.extra !== '0%' ? (
                        <span className="ml-1 text-primary">(+{s.extra})</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </StatBlock>
            ) : null}

            {detail.subStats?.length ? (
              <StatBlock emoji="🎯" title="조율">
                {detail.subStats.map((s, i) => (
                  <li key={`${s.id}-${i}`} className="flex items-baseline justify-between gap-2">
                    <span className="text-muted-foreground">{s.name}</span>
                    <span className="font-medium tabular-nums">{s.value}</span>
                  </li>
                ))}
              </StatBlock>
            ) : null}

            {detail.magicStoneStat?.length ? (
              <StatBlock emoji="💎" title={`마석 (${detail.magicStoneStat.length}/${detail.magicStoneSlotCount})`}>
                {detail.magicStoneStat.map((s, i) => (
                  <li key={`${s.id}-${i}`} className="flex items-baseline justify-between gap-2">
                    <span style={{ color: gradeColor(s.grade) }}>{s.name}</span>
                    <span className="font-medium tabular-nums">{s.value}</span>
                  </li>
                ))}
              </StatBlock>
            ) : null}

            {detail.godStoneStat?.length ? (
              <StatBlock emoji="✨" title="신석">
                {detail.godStoneStat.map((s, i) => (
                  <li key={i} className="flex flex-col gap-1">
                    <span className="font-medium" style={{ color: gradeColor(s.grade) }}>
                      {s.name}
                    </span>
                    {s.desc
                      ? s.desc.split('\n').map((line, j) => (
                          <span key={j} className="text-muted-foreground">
                            └ {line}
                          </span>
                        ))
                      : null}
                  </li>
                ))}
              </StatBlock>
            ) : null}

            <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-xl bg-secondary/50 px-3 py-2.5 text-[11px] text-muted-foreground">
              <span>착용 레벨 {detail.equipLevel}</span>
              <span>아이템 레벨 {detail.level}</span>
              {detail.classNames?.length ? <span>{detail.classNames.join(', ')}</span> : null}
              {detail.sources?.length ? <span>획득 {detail.sources.join(', ')}</span> : null}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function StatBlock({
  emoji,
  title,
  children,
}: {
  emoji: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-secondary/30 p-3">
      <p className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold">
        <span aria-hidden>{emoji}</span>
        {title}
      </p>
      <ul className="flex flex-col gap-1.5 text-[12.5px]">{children}</ul>
    </div>
  )
}
