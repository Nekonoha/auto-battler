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

describe('StatusEffectSystem - composite / direct apply rules', () => {
  test('複合効果は親のスタックをそのまま子に適用する', () => {
    const unit = createUnit()

    // electrification は子3つ。5スタック付与 → 各子5スタック
    StatusEffectSystem.applyStatusEffect(unit, 'electrification', 5, 5)

    const dot = unit.statusEffects.find(e => e.type === 'electrificationDot')
    const slow = unit.statusEffects.find(e => e.type === 'electrificationSlow')
    const para = unit.statusEffects.find(e => e.type === 'electrificationParalysis')

    expect(dot?.stacks).toBe(5)
    expect(slow?.stacks).toBe(5)
    expect(para?.stacks).toBe(5)
    // 親の maxDuration=2 が子にも適用される
    expect(dot?.duration).toBe(2)
    expect(slow?.duration).toBe(2)
    expect(para?.duration).toBe(2)
  })

  test('allowDirectApply=false な子エフェクトは直接付与できない', () => {
    const unit = createUnit()
    const result = StatusEffectSystem.applyStatusEffect(unit, 'burnWeaken', 3, 2)

    expect(result.applied).toBe(false)
    expect(unit.statusEffects.find(e => e.type === 'burnWeaken')).toBeUndefined()
  })

  test('cannotActProbability はスタック数に応じて発動確率が上がる', () => {
    const unit = createUnit()
    StatusEffectSystem.applyStatusEffect(unit, 'electrificationParalysis', 3, 2)

    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.0)
    expect(StatusEffectSystem.cannotAct(unit)).toBe(true) // 3*20=60%で確定発動に十分低い
    spy.mockReturnValue(0.99)
    expect(StatusEffectSystem.cannotAct(unit)).toBe(false) // 99% は 60% を上回るので行動可
    spy.mockRestore()
  })

  test('ステータス低下デバフで速度が下がる', () => {
    const unit = createUnit()
    StatusEffectSystem.applyStatusEffect(unit, 'electrificationSlow', 2, 2)

    const mods = StatusEffectSystem.getStatModifiers(unit)
    expect(mods.speed).toBeLessThan(0)
    expect(mods.speed).toBe(-20)
  })
})
