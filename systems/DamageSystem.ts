import type { Enemy, Player } from '~/types';

export class DamageSystem {
    /**
     * Calculates the damage dealt to a defender after considering their defense.
     * Uses the formula: FinalDamage = BaseDamage * (100 / (100 + DefenderDefense))
     * @param baseDamage The base damage of the attack.
     * @param defender The defending entity (player or enemy).
     * @param isMagic Determines if magic defense should be used.
     * @returns The calculated damage, rounded to the nearest integer.
     */
    static calculateDamage(baseDamage: number, defender: Player | Enemy, isMagic = false): number {
        const defense = isMagic ? defender.stats.magicDefense : defender.stats.defense;
        const finalDamage = baseDamage * (100 / (100 + defense));
        return Math.round(finalDamage);
    }

    /**
     * 敵の特性を考慮したダメージ計算
     * @param baseDamage 基本ダメージ
     * @param defender 防御側（敵）
     * @param isMagic 魔法攻撃かどうか
     * @param weaponType 武器タイプ（攻撃無効判定用）
     * @returns 最終ダメージと耐性情報
     */
    static calculateDamageWithTraits(
        baseDamage: number, 
        defender: Enemy, 
        isMagic = false,
        weaponType?: string
    ): { damage: number; resistanceApplied: number; blocked: boolean } {
        // 攻撃タイプ無効チェック
        if (weaponType && defender.traits?.attackImmunities?.includes(weaponType as any)) {
            return { damage: 0, resistanceApplied: 100, blocked: true };
        }

        // 通常の防御計算
        const defense = isMagic ? defender.stats.magicDefense : defender.stats.defense;
        let finalDamage = baseDamage * (100 / (100 + defense));

        // 耐性適用
        let resistancePercent = 0;
        if (isMagic && defender.traits?.magicalResistance) {
            resistancePercent = defender.traits.magicalResistance;
        } else if (!isMagic && defender.traits?.physicalResistance) {
            resistancePercent = defender.traits.physicalResistance;
        }

        // 耐性によるダメージ軽減/増加
        if (resistancePercent !== 0) {
            const multiplier = 1 - (resistancePercent / 100);
            finalDamage = finalDamage * multiplier;
        }

        return { 
            damage: Math.max(0, Math.round(finalDamage)), 
            resistanceApplied: resistancePercent,
            blocked: false
        };
    }
}

