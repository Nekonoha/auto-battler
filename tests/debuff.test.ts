import { STATUS_EFFECTS_DB } from '../data/statusEffects'

describe('状態異常定義の検証', () => {
  test('DoT 系デバフは damageOverTime を持ち、スタック上限が定義されている（実質無制限）', () => {
    const dotEffects = ['poison', 'bleed', 'burnDot', 'kissed', 'epidemic'] as const

    dotEffects.forEach(type => {
      const effect = STATUS_EFFECTS_DB[type]
      expect(effect.effects.damageOverTime?.enabled).toBe(true)
        expect(effect.stackable).toBe(true)
        expect(effect.maxStack).toBeGreaterThan(0)
    })
  })

  test('行動不能系デバフは cannotAct が有効', () => {
    const controlEffects = ['stun', 'sleepLock', 'frozenLock', 'petrificationLock'] as const

    controlEffects.forEach(type => {
      const effect = STATUS_EFFECTS_DB[type]
      expect(effect.effects.cannotAct).toBe(true)
    })
  })

  test('sleep は被ダメージ増加とダメージで解除が定義されている', () => {
    const sleepVuln = STATUS_EFFECTS_DB.sleepVulnerable
    expect(sleepVuln.effects.damageTakenModifier).toBe(25)
    expect(sleepVuln.effects.breakOnDamage).toBe(true)
    expect(sleepVuln.maxStack).toBe(1)
    expect(sleepVuln.refreshRule).toBe('refresh')
  })

  test('凍結・石化は複合効果として子エフェクトを持つ', () => {
    const frozen = STATUS_EFFECTS_DB.frozen
    const petrif = STATUS_EFFECTS_DB.petrification
    expect(frozen.compositeEffects?.map(c => c.type)).toEqual(['frozenLock', 'frozenGuard'])
    expect(petrif.compositeEffects?.map(c => c.type)).toEqual(['petrificationLock', 'petrificationGuard'])
  })

  test('vulnerable は被ダメージ増加を持ち、スタック可能', () => {
    const vulnerable = STATUS_EFFECTS_DB.vulnerable
    expect(vulnerable.effects.damageTakenModifier).toBe(15)
    expect(vulnerable.stackable).toBe(true)
    expect(vulnerable.maxStack).toBe(5)
  })

  test('stackable な効果は maxStack が定義されている', () => {
    Object.values(STATUS_EFFECTS_DB)
      .filter(effect => effect.stackable)
      .forEach(effect => {
        expect(effect.maxStack).toBeGreaterThan(0)
      })
  })
})
