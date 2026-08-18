// 아이온2 캐릭터 정보실(aion2.plaync.com) 응답 타입과 표시용 상수.

export type Grade =
  | 'None'
  | 'Common'
  | 'Rare'
  | 'Legend'
  | 'Unique'
  | 'Epic'
  | 'Mythic'
  | 'Special'

/** 공식 사이트 다크모드 등급 색상 */
export const GRADE_COLOR: Record<string, string> = {
  None: '#ededed',
  Common: '#ededed',
  Rare: '#52b35c',
  Legend: '#3d94d8',
  Unique: '#e9a43a',
  Epic: '#ee6c2a',
  Mythic: '#d33939',
  Special: '#34b798',
}

export const GRADE_LABEL: Record<string, string> = {
  None: '일반',
  Common: '일반',
  Rare: '희귀',
  Legend: '전설',
  Unique: '고유',
  Epic: '영웅',
  Mythic: '신화',
  Special: '특수',
}

export function gradeColor(grade?: string | null) {
  return GRADE_COLOR[grade ?? 'None'] ?? GRADE_COLOR.None
}

export const RACE_NAME: Record<number, string> = { 1: '천족', 2: '마족' }
export const RACE_EMOJI: Record<number, string> = { 1: '🕊️', 2: '🦇' }

export interface ServerInfo {
  raceId: number
  serverId: number
  serverName: string
  serverShortName: string
}

export interface SearchCharacter {
  characterId: string
  level: number
  name: string
  race: number
  pcId: number
  serverId: number
  serverName: string
  profileImageUrl: string
}

export interface SearchResponse {
  list: SearchCharacter[]
  pagination: { page: number; size: number; total: number; endPage: number }
}

export interface CharacterProfile {
  characterId: string
  characterLevel: number
  characterName: string
  className: string
  combatPower: number
  gender: number
  genderName: string
  pcId: number
  profileImage: string
  raceId: number
  raceName: string
  regionName: string
  serverId: number
  serverName: string
  titleGrade: string
  titleId: number
  titleName: string
}

export interface StatEntry {
  name: string
  type: string
  value: number
  statSecondList: string[]
}

export interface TitleEntry {
  id: number
  name: string
  grade: string
  equipCategory: string
  equipStatList: { desc: string }[]
  statList: { desc: string }[]
  ownedCount: number
  ownedPercent: number
  totalCount: number
}

export interface DaevanionBoard {
  id: number
  name: string
  icon: string
  open: number
  openNodeCount: number
  totalNodeCount: number
  openPercent: number
}

export interface CharacterInfo {
  profile: CharacterProfile
  stat: { statList: StatEntry[] }
  title: { ownedCount: number; totalCount: number; titleList: TitleEntry[] }
  ranking: { rankingList: unknown }
  daevanion: { boardList: DaevanionBoard[] }
}

export interface EquipItem {
  id: number
  name: string
  grade: string
  icon: string
  enchantLevel: number
  exceedLevel: number
  slotPos: number
  slotPosName: string
}

export interface PetWing {
  pet: { id: number; name: string; icon: string; level: number } | null
  wing: { id: number; name: string; icon: string; grade: string; enchantLevel: number } | null
  wingSkin: { id: number; name: string; icon: string; grade: string; enchantLevel: number } | null
}

export interface SkillEntry {
  id: number
  name: string
  icon: string
  category: 'Active' | 'Passive' | 'Dp' | string
  skillLevel: number
  needLevel: number
  acquired: number
  equip: number
}

export interface EquipmentResponse {
  equipment: { equipmentList: EquipItem[]; skinList: EquipItem[] }
  petwing: PetWing
  skill: { skillList: SkillEntry[] }
}

export interface ItemStat {
  id: string
  name: string
  value: string
  extra?: string
  minValue?: string
  exceed?: boolean
}

export interface StoneStat {
  id: string
  name: string
  value: string
  icon: string
  grade: string
  slotPos: number
}

export interface ItemSubSkill {
  id: number
  name: string
  icon: string
  level: number
}

export interface ItemSetBonus {
  degree: number
  descriptions: string[]
}

export interface ItemSet {
  id: string
  name: string
  equippedCount: number
  items: { id: number; name: string; grade: string; equipped?: boolean }[]
  bonuses: ItemSetBonus[]
}

export interface ItemDetail {
  id: number
  name: string
  grade: string
  gradeName: string
  icon: string
  level: number
  enchantLevel: number
  maxEnchantLevel: number
  maxExceedEnchantLevel: number
  equipLevel: number
  categoryName: string
  raceName: string
  classNames: string[]
  magicStoneSlotCount: number
  godStoneSlotCount: number
  soulBindRate?: string
  mainStats: ItemStat[]
  subStats: ItemStat[]
  magicStoneStat: StoneStat[]
  godStoneStat: { name: string; desc?: string; icon?: string; grade?: string }[]
  // 아르카나 일부는 능력 대부분이 여기 들어 있다 (mainStats 는 1~2개뿐)
  subSkills?: ItemSubSkill[]
  set?: ItemSet
  sources?: string[]
}

export interface DaevanionNode {
  boardId: number
  nodeId: number
  row: number
  col: number
  name: string
  icon: string
  grade: string
  type: string
  open: number
  effectList: { desc: string }[]
}

export interface DaevanionDetail {
  nodeList: DaevanionNode[]
  openStatEffectList: { desc: string }[]
  openSkillEffectList: { desc: string }[]
}

/** 장비 슬롯 한글 라벨 */
export const SLOT_LABEL: Record<string, string> = {
  MainHand: '무기',
  SubHand: '가더',
  Helmet: '투구',
  Shoulder: '견갑',
  Torso: '상의',
  Pants: '하의',
  Gloves: '장갑',
  Boots: '신발',
  Cape: '망토',
  Belt: '벨트',
  Necklace: '목걸이',
  Pendant: '펜던트',
  Amulet: '아뮬렛',
  Earring1: '귀걸이 1',
  Earring2: '귀걸이 2',
  Ring1: '반지 1',
  Ring2: '반지 2',
  Bracelet1: '팔찌 1',
  Bracelet2: '팔찌 2',
  Brooch1: '브로치 1',
  Brooch2: '브로치 2',
  Rune1: '룬 1',
  Rune2: '룬 2',
}
for (let i = 1; i <= 10; i += 1) SLOT_LABEL[`Arcana${i}`] = `아르카나 ${i}`

export function slotLabel(slotPosName: string) {
  return SLOT_LABEL[slotPosName] ?? slotPosName
}

export interface EquipGroup {
  key: string
  label: string
  emoji: string
  slots: string[]
}

/** 장비를 화면에 묶어서 보여줄 그룹 */
export const EQUIP_GROUPS: EquipGroup[] = [
  { key: 'weapon', label: '무기', emoji: '⚔️', slots: ['MainHand', 'SubHand'] },
  {
    key: 'armor',
    label: '방어구',
    emoji: '🛡️',
    slots: ['Helmet', 'Shoulder', 'Torso', 'Pants', 'Gloves', 'Boots', 'Cape', 'Belt'],
  },
  {
    key: 'acc',
    label: '장신구',
    emoji: '💍',
    slots: [
      'Necklace',
      'Earring1',
      'Earring2',
      'Ring1',
      'Ring2',
      'Bracelet1',
      'Bracelet2',
      'Brooch1',
      'Brooch2',
      'Pendant',
      'Amulet',
    ],
  },
  { key: 'rune', label: '룬', emoji: '🔮', slots: ['Rune1', 'Rune2'] },
]

/** 아르카나는 별도 탭으로 뺐다 */
export const ARCANA_GROUPS: EquipGroup[] = [
  {
    key: 'arcana',
    label: '아르카나',
    emoji: '🎴',
    slots: Array.from({ length: 10 }, (_, i) => `Arcana${i + 1}`),
  },
]

export const SKILL_CATEGORY: { key: string; label: string; emoji: string }[] = [
  { key: 'Active', label: '액티브', emoji: '💥' },
  { key: 'Passive', label: '패시브', emoji: '🌿' },
  { key: 'Dp', label: 'DP', emoji: '🔥' },
]

/** 스탯 표시 순서/그룹 */
export const PRIMARY_STATS = ['STR', 'DEX', 'INT', 'CON', 'AGI', 'WIS']

export function formatNumber(n: number | undefined | null) {
  if (n == null) return '-'
  return n.toLocaleString('ko-KR')
}

/** 검색 결과 이름에 <strong> 하이라이트가 섞여 오므로 제거 */
export function stripTags(s: string) {
  return s.replace(/<[^>]*>/g, '')
}

export function profileImageSrc(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `https://profileimg.plaync.com${url}`
}
