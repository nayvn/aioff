import { useEffect, useState } from 'react'
import { getCharacterInfo, getEquipment } from '@/lib/api'
import type { CharacterInfo, EquipmentResponse } from '@/lib/aion2'
import { RACE_EMOJI, formatNumber, gradeColor } from '@/lib/aion2'
import { EmptyState, Panel } from '@/components/common'
import { EquipmentSection } from '@/components/equipment'
import { DaevanionSection } from '@/components/daevanion'
import { PetWingSection, SkillSection, StatSection, TitleSection } from '@/components/sections'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

const TABS = [
  { key: 'summary', label: '요약', emoji: '📋' },
  { key: 'equip', label: '장비', emoji: '⚔️' },
  { key: 'card', label: '카드', emoji: '🃏' },
  { key: 'skill', label: '스킬', emoji: '✨' },
]

/** 탭도 주소에 남겨서 링크를 그대로 공유할 수 있게 한다. */
function initialTab() {
  const t = new URLSearchParams(window.location.search).get('t')
  return TABS.some((x) => x.key === t) ? (t as string) : 'summary'
}

function syncTabToUrl(tab: string) {
  const params = new URLSearchParams(window.location.search)
  if (tab === 'summary') params.delete('t')
  else params.set('t', tab)
  const qs = params.toString()
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
}

export function CharacterView({
  characterId,
  serverId,
}: {
  characterId: string
  serverId: number
}) {
  const [info, setInfo] = useState<CharacterInfo | null>(null)
  const [equip, setEquip] = useState<EquipmentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setInfo(null)
    setEquip(null)
    setError(null)
    window.scrollTo({ top: 0 })

    getCharacterInfo(characterId, serverId)
      .then((d) => alive && setInfo(d))
      .catch((e: Error) => alive && setError(e.message))
    getEquipment(characterId, serverId)
      .then((d) => alive && setEquip(d))
      .catch(() => {})

    return () => {
      alive = false
    }
  }, [characterId, serverId])

  if (error) {
    return <EmptyState emoji="🚨" title="캐릭터 정보를 못 불러왔어요" desc={error} />
  }

  if (!info) return <DetailSkeleton />

  const itemLevel = info.stat.statList.find((s) => s.type === 'ItemLevel')?.value
  const target = { characterId, serverId }

  return (
    <div className="flex flex-col gap-5 px-4 pt-4">
      <ProfileCard info={info} itemLevel={itemLevel} />

      <Tabs defaultValue={initialTab()} onValueChange={syncTabToUrl} className="gap-4">
        <TabsList className="sticky top-[58px] z-20 grid w-full grid-cols-4 bg-background/90 backdrop-blur">
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="text-[13px]">
              <span aria-hidden className="mr-1">
                {t.emoji}
              </span>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="summary" className="flex flex-col gap-6">
          <StatSection stats={info.stat.statList} />
          {equip ? <PetWingSection petwing={equip.petwing} /> : <Skeleton className="h-24 w-full rounded-2xl" />}
          <TitleSection
            titles={info.title?.titleList ?? []}
            ownedCount={info.title?.ownedCount ?? 0}
            totalCount={info.title?.totalCount ?? 0}
          />
        </TabsContent>

        <TabsContent value="equip">
          {equip ? (
            <EquipmentSection items={equip.equipment.equipmentList} target={target} />
          ) : (
            <Skeleton className="h-96 w-full rounded-2xl" />
          )}
        </TabsContent>

        <TabsContent value="card">
          <DaevanionSection boards={info.daevanion?.boardList ?? []} target={target} />
        </TabsContent>

        <TabsContent value="skill">
          {equip ? (
            <SkillSection skills={equip.skill.skillList} />
          ) : (
            <Skeleton className="h-96 w-full rounded-2xl" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProfileCard({ info, itemLevel }: { info: CharacterInfo; itemLevel?: number }) {
  const p = info.profile
  return (
    <Panel className="relative overflow-hidden p-0">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-transparent" />
      <div className="relative flex items-center gap-3.5 p-4">
        <img
          src={p.profileImage}
          alt=""
          className="h-16 w-16 shrink-0 rounded-2xl bg-black/40 object-cover ring-1 ring-white/10"
        />
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-[11.5px] font-medium"
            style={{ color: gradeColor(p.titleGrade) }}
          >
            {p.titleName}
          </p>
          <h1 className="truncate text-[20px] font-bold tracking-tight">{p.characterName}</h1>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[12px] text-muted-foreground">
            <span>
              {RACE_EMOJI[p.raceId]} {p.serverName}
            </span>
            <span aria-hidden>·</span>
            <span>{p.className}</span>
            <span aria-hidden>·</span>
            <span>Lv.{p.characterLevel}</span>
          </p>
        </div>
      </div>

      <div className="relative grid grid-cols-2 divide-x divide-border/60 border-t border-border/60">
        <div className="px-4 py-3">
          <p className="text-[11px] text-muted-foreground">⚡ 전투력</p>
          <p className="text-[19px] font-bold tabular-nums text-primary">
            {formatNumber(p.combatPower)}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[11px] text-muted-foreground">🗡️ 템 레벨</p>
          <p className="text-[19px] font-bold tabular-nums">{formatNumber(itemLevel)}</p>
        </div>
      </div>
    </Panel>
  )
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <Skeleton className="h-[152px] w-full rounded-2xl" />
      <Skeleton className="h-9 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
