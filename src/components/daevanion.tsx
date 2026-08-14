import { useEffect, useState } from 'react'
import { getDaevanionDetail } from '@/lib/api'
import type { DaevanionBoard, DaevanionDetail, DaevanionNode } from '@/lib/aion2'
import { gradeColor } from '@/lib/aion2'
import { GameIcon, Panel, SheetHandle } from '@/components/common'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'

interface Target {
  characterId: string
  serverId: number
}

/** 데바니온 = 인게임 카드작. 보드 8개의 개방률을 보여주고, 누르면 노드 배치를 펼친다. */
export function DaevanionSection({
  boards,
  target,
}: {
  boards: DaevanionBoard[]
  target: Target
}) {
  const [selected, setSelected] = useState<DaevanionBoard | null>(null)

  const totalOpen = boards.reduce((a, b) => a + b.openNodeCount, 0)
  const totalNodes = boards.reduce((a, b) => a + b.totalNodeCount, 0)
  const overall = totalNodes ? Math.floor((totalOpen / totalNodes) * 100) : 0

  return (
    <>
      <Panel className="mb-4 flex items-center gap-3">
        <span className="text-2xl" aria-hidden>
          🃏
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted-foreground">전체 개방률</p>
          <p className="text-lg font-bold tabular-nums">
            {overall}%
            <span className="ml-2 text-[12px] font-normal text-muted-foreground">
              {totalOpen.toLocaleString()} / {totalNodes.toLocaleString()} 노드
            </span>
          </p>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-2.5">
        {boards.map((board) => (
          <button
            key={board.id}
            type="button"
            onClick={() => setSelected(board)}
            className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-card p-3 text-left transition-colors active:bg-accent/50"
          >
            <div className="flex items-center gap-2">
              <GameIcon src={board.icon} size={30} grade="Common" alt="" />
              <span className="truncate text-[13px] font-semibold">{board.name}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${board.openPercent}%` }}
              />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-bold tabular-nums text-primary">
                {board.openPercent}%
              </span>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {board.openNodeCount}/{board.totalNodeCount}
              </span>
            </div>
          </button>
        ))}
      </div>

      <BoardSheet board={selected} target={target} onClose={() => setSelected(null)} />
    </>
  )
}

function BoardSheet({
  board,
  target,
  onClose,
}: {
  board: DaevanionBoard | null
  target: Target
  onClose: () => void
}) {
  const [detail, setDetail] = useState<DaevanionDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [node, setNode] = useState<DaevanionNode | null>(null)
  // 닫히는 애니메이션 동안 내용이 사라지지 않도록 마지막 보드를 붙잡아 둔다.
  const [shown, setShown] = useState<DaevanionBoard | null>(null)

  useEffect(() => {
    if (board) setShown(board)
  }, [board])

  useEffect(() => {
    if (!board) return
    let alive = true
    setDetail(null)
    setNode(null)
    setLoading(true)
    getDaevanionDetail(target.characterId, target.serverId, board.id)
      .then((d) => alive && setDetail(d))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [board, target.characterId, target.serverId])

  const cols = detail ? Math.max(...detail.nodeList.map((n) => n.col)) : 15
  const rows = detail ? Math.max(...detail.nodeList.map((n) => n.row)) : 15

  return (
    <Sheet open={!!board} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-h-[88dvh] max-w-[520px] overflow-y-auto rounded-t-3xl px-4 pb-8"
      >
        <SheetHandle />
        {shown ? (
          <SheetHeader className="gap-2 px-0 pt-0">
            <div className="flex items-center gap-3">
              <GameIcon src={shown.icon} size={44} grade="Common" alt="" />
              <div>
                <SheetTitle className="text-base">{shown.name} 보드</SheetTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  개방 {shown.openNodeCount}/{shown.totalNodeCount} · {shown.openPercent}%
                </p>
              </div>
            </div>
          </SheetHeader>
        ) : null}

        {loading ? <Skeleton className="h-64 w-full rounded-2xl" /> : null}

        {detail ? (
          <div className="flex flex-col gap-4 pt-1">
            <div
              className="grid gap-[3px] rounded-2xl bg-black/25 p-2"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: rows * cols }, (_, i) => {
                const row = Math.floor(i / cols) + 1
                const col = (i % cols) + 1
                const n = detail.nodeList.find((x) => x.row === row && x.col === col)
                return <NodeCell key={i} node={n} onClick={setNode} />
              })}
            </div>

            {node ? (
              <div className="rounded-xl border border-border/70 bg-secondary/40 p-3 text-[12.5px]">
                <p className="font-semibold" style={{ color: gradeColor(node.grade) }}>
                  {node.name || '빈 노드'}
                  <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                    {node.open ? '개방 완료' : '미개방'}
                  </span>
                </p>
                <ul className="mt-1.5 flex flex-col gap-1 text-muted-foreground">
                  {node.effectList.map((e, i) => (
                    <li key={i}>└ {e.desc}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-center text-[11.5px] text-muted-foreground">
                💡 노드를 누르면 효과가 표시됩니다
              </p>
            )}

            {detail.openStatEffectList?.length ? (
              <EffectBlock emoji="📈" title="개방 스탯 효과" items={detail.openStatEffectList} />
            ) : null}
            {detail.openSkillEffectList?.length ? (
              <EffectBlock emoji="🌀" title="개방 스킬 효과" items={detail.openSkillEffectList} />
            ) : null}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function NodeCell({
  node,
  onClick,
}: {
  node?: DaevanionNode
  onClick: (n: DaevanionNode) => void
}) {
  if (!node || node.type === 'None') {
    return <span className="aspect-square rounded-[3px] bg-white/[0.03]" />
  }
  const color = gradeColor(node.grade)
  const open = node.open === 1
  return (
    <button
      type="button"
      onClick={() => onClick(node)}
      title={node.name}
      className="aspect-square rounded-[3px] transition-transform active:scale-90"
      style={{
        background: open ? `${color}cc` : 'rgba(255,255,255,0.07)',
        boxShadow: open ? `0 0 4px ${color}66` : `inset 0 0 0 1px ${color}33`,
      }}
    />
  )
}

function EffectBlock({
  emoji,
  title,
  items,
}: {
  emoji: string
  title: string
  items: { desc: string }[]
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-secondary/30 p-3">
      <p className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold">
        <span aria-hidden>{emoji}</span>
        {title}
      </p>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
        {items.map((e, i) => (
          <li key={i} className="truncate">
            {e.desc}
          </li>
        ))}
      </ul>
    </div>
  )
}
