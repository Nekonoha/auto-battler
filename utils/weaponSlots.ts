export function getWeaponSlotCost(slotNumber: number): number {
  if (slotNumber <= 2) return 0
  if (slotNumber === 3) return 3000
  if (slotNumber === 4) return 10000

  const base = 15000
  const exponent = slotNumber - 4
  const cost = base * Math.pow(1.8, exponent)

  // 100G単位で丸めて扱いやすくする
  return Math.round(cost / 100) * 100
}

export function getNextWeaponSlotCost(currentSlots: number): number {
  const targetSlot = currentSlots + 1
  return getWeaponSlotCost(targetSlot)
}
