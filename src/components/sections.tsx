import type { PetWing, SkillEntry, StatEntry, TitleEntry } from '@/lib/aion2'
import { PRIMARY_STATS, SKILL_CATEGORY, formatNumber, gradeColor } from '@/lib/aion2'
import { GameIcon, Panel, Section } from '@/components/common'

export function StatSection({ stats }: { stats: StatEntry[] }) {
  const primary = stats.filter((s) => PRIMARY_STATS.includes(s.type))
  const divine = stats.filter((s) => !PRIMARY_STATS.includes(s.type) && s.type !== 'ItemLevel')

  return (
    <div className="flex flex-col gap-6">
      <Section emoji="📊" title="기본 스탯">
        <div className="grid grid-cols-2 gap-2">
          {primary.map((s) => (
            <div key={s.type} className="rounded-xl border border-border/70 bg-card p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] text-muted-foreground">{s.name}</span>
                <span className="text-[17px] font-bold tabular-nums">{formatNumber(s.value)}</span>
              </div>
              {s.statSecondList?.length ? (
                <ul className="mt-1.5 flex flex-col gap-0.5 text-[11px] text-muted-foreground">
                  {s.statSecondList.map((d, i) => (
                    <li key={i} className="truncate">
                      {d}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </Section>

      {divine.length ? (
        <Section emoji="🌌" title="신성 스탯">
          <Panel className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12.5px]">
            {divine.map((s) => (
              <div key={s.type} className="flex items-baseline justify-between gap-2">
                <span className="truncate text-muted-foreground">{s.name}</span>
                <span className="font-semibold tabular-nums">{formatNumber(s.value)}</span>
              </div>
            ))}
          </Panel>
        </Section>
      ) : null}
    </div>
  )
}

export function PetWingSection({ petwing }: { petwing: PetWing }) {
  const { pet, wing, wingSkin } = petwing ?? {}
  if (!pet && !wing && !wingSkin) return null

  return (
    <Section emoji="🐾" title="펫 · 날개">
      <div className="flex flex-col gap-2">
        {pet ? (
          <Panel className="flex items-center gap-3">
            <GameIcon src={pet.icon} size={48} grade="Unique" alt={pet.name} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground">펫</p>
              <p className="truncate text-[14px] font-semibold">{pet.name}</p>
            </div>
            <span className="rounded-lg bg-primary/15 px-2 py-1 text-[12px] font-bold text-primary tabular-nums">
              Lv.{pet.level}
            </span>
          </Panel>
        ) : null}

        {wing ? <GearRow label="날개" item={wing} /> : null}
        {wingSkin ? <GearRow label="날개 스킨" item={wingSkin} /> : null}
      </div>
    </Section>
  )
}

function GearRow({
  label,
  item,
}: {
  label: string
  item: { name: string; icon: string; grade: string; enchantLevel: number }
}) {
  return (
    <Panel className="flex items-center gap-3">
      <GameIcon src={item.icon} size={48} grade={item.grade} alt={item.name} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-[14px] font-semibold" style={{ color: gradeColor(item.grade) }}>
          {item.name}
        </p>
      </div>
      {item.enchantLevel ? (
        <span className="text-[13px] font-bold text-primary tabular-nums">
          +{item.enchantLevel}
        </span>
      ) : null}
    </Panel>
  )
}

export function TitleSection({
  titles,
  ownedCount,
  totalCount,
}: {
  titles: TitleEntry[]
  ownedCount: number
  totalCount: number
}) {
  if (!titles?.length) return null
  return (
    <Section
      emoji="🏅"
      title="장착 칭호"
      right={
        <span className="text-xs text-muted-foreground tabular-nums">
          보유 {formatNumber(ownedCount)}/{formatNumber(totalCount)}
        </span>
      }
    >
      <div className="flex flex-col gap-2">
        {titles.map((t) => (
          <Panel key={t.id} className="flex flex-col gap-1.5">
            <p className="text-[14px] font-semibold" style={{ color: gradeColor(t.grade) }}>
              {t.name}
            </p>
            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
              {[...(t.equipStatList ?? []), ...(t.statList ?? [])].map((s, i) => (
                <li key={i}>{s.desc}</li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </Section>
  )
}

export function SkillSection({ skills }: { skills: SkillEntry[] }) {
  return (
    <div className="flex flex-col gap-6">
      {SKILL_CATEGORY.map((cat) => {
        const rows = skills
          .filter((s) => s.category === cat.key)
          .sort((a, b) => b.equip - a.equip || b.skillLevel - a.skillLevel)
        if (!rows.length) return null
        return (
          <Section
            key={cat.key}
            emoji={cat.emoji}
            title={cat.label}
            right={<span className="text-xs text-muted-foreground">{rows.length}</span>}
          >
            <Panel className="grid grid-cols-1 gap-1.5 p-2.5">
              {rows.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5"
                  style={{ opacity: s.acquired ? 1 : 0.45 }}
                >
                  <GameIcon src={s.icon} size={32} grade={s.equip ? 'Unique' : 'Common'} alt="" />
                  <span className="min-w-0 flex-1 truncate text-[13px]">
                    {s.equip ? <span className="text-primary">★ </span> : null}
                    {s.name}
                  </span>
                  <span className="text-[12px] font-semibold tabular-nums text-muted-foreground">
                    Lv.{s.skillLevel}
                  </span>
                </div>
              ))}
            </Panel>
          </Section>
        )
      })}
    </div>
  )
}
