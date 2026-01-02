import { StatusEffectSystem } from '../systems/StatusEffectSystem'
import { STATUS_EFFECTS_DB } from '../data/statusEffects'
import type { CombatUnit } from '../types'

const createUnit = (): CombatUnit => ({
  name: 'dummy',
  maxHp: 100,
  currentHp: 100,
  statusEffects: []
})

describe('StatusEffectSystem - stacking rules', () => {
  test('maxStack でスタック数が上限に達する', () => {
    const unit = createUnit()
    StatusEffectSystem.applyStatusEffect(unit, 'poison', 8, 2)
    StatusEffectSystem.applyStatusEffect(unit, 'poison', 5, 2)

    const applied = unit.statusEffects.find(e => e.type === 'poison')
    expect(applied?.stacks).toBe(13)
  })

  test('行動不能系はスタックせず、後からの付与でも持続は上限でクランプされる', () => {
    const unit = createUnit()

    StatusEffectSystem.applyStatusEffect(unit, 'sleep', 1, 2)
    StatusEffectSystem.applyStatusEffect(unit, 'sleep', 2, 5)

    const lock = unit.statusEffects.find(e => e.type === 'sleepLock')
    const vuln = unit.statusEffects.find(e => e.type === 'sleepVulnerable')

    expect(lock?.stacks).toBe(1)
    expect(lock?.duration).toBe(1)
    expect(vuln?.stacks).toBe(1)
    expect(vuln?.duration).toBe(1)
  })
})

describe('StatusEffectSystem - DoT 処理', () => {
  test('damageOverTime は定義の damagePerStack を利用する', () => {
    const unit = createUnit()
    StatusEffectSystem.applyStatusEffect(unit, 'poison', 3, 2)

    const results = StatusEffectSystem.processStatusEffects(unit)
    const dot = STATUS_EFFECTS_DB.poison.effects.damageOverTime!
    const expectedDamage = 3 * (dot.damagePerStack || 0)

    expect(results[0].damage).toBe(expectedDamage)
    expect(unit.currentHp).toBe(100 - expectedDamage)
  })

  test('burn は DoT とステータス低下に分割され、それぞれ別スタックになる', () => {
    const unit = createUnit()
    StatusEffectSystem.applyStatusEffect(unit, 'burn', 4, 2)

    const burnDot = unit.statusEffects.find(e => e.type === 'burnDot')
    const burnWeaken = unit.statusEffects.find(e => e.type === 'burnWeaken')

    expect(burnDot?.stacks).toBe(4)
    expect(burnWeaken?.stacks).toBe(4)
  })

  test('burnWeaken のスタックは maxStack で制限されるが burnDot は制限されない', () => {
    const unit = createUnit()
    StatusEffectSystem.applyStatusEffect(unit, 'burn', 10, 2)

    const burnDot = unit.statusEffects.find(e => e.type === 'burnDot')
    const burnWeaken = unit.statusEffects.find(e => e.type === 'burnWeaken')

    expect(burnDot?.stacks).toBe(10)
    expect(burnWeaken?.stacks).toBe(STATUS_EFFECTS_DB.burnWeaken.maxStack)
  })
})
