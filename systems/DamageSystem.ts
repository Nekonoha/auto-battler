import type { Enemy, Player } from '~/types';

export class DamageSystem {
    private static defenseMultiplier(defense: number): number {
        const def = Math.max(0, defense);
        const ratio = def / (def + 200); // 200 で半減寄りのなだらか曲線
        const multiplier = 1 - 0.7 * ratio; // 防御が無限大でも 30% ダメージは通す
        return Math.max(0.2, multiplier); // 安全下限
    }

    /**
     * Calculates the damage dealt to a defender after considering their defense.
     * Uses a diminishing-returns curve so defense cannot zero-out damage.
     */
    static calculateDamage(baseDamage: number, defender: Player | Enemy, isMagic = false): number {
        const defense = isMagic ? defender.stats.magicDefense : defender.stats.defense;
        const finalDamage = baseDamage * this.defenseMultiplier(defense);
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
        let finalDamage = baseDamage * this.defenseMultiplier(defense);

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

    /**
     * プレイヤーが受けるダメージに武器traitsを適用
     * @param baseDamage 基本ダメージ
     * @param player プレイヤー
     * @param isMagic 魔法攻撃かどうか
     * @param weaponTraitsBonus 装備武器からのtraitsボーナス
     * @returns 最終ダメージ
     */
    static calculatePlayerDamageWithTraits(
        baseDamage: number,
        player: Player,
        isMagic: boolean,
        weaponTraitsBonus?: { 
            physicalResistance: number
            magicalResistance: number
            damageReduction: number
        }
    ): number {
        // 通常の防御計算
        const defense = isMagic ? player.stats.magicDefense : player.stats.defense;
        let finalDamage = baseDamage * this.defenseMultiplier(defense);

        if (!weaponTraitsBonus) {
            return Math.round(finalDamage);
        }

        // 耐性適用
        let resistancePercent = 0;
        if (isMagic && weaponTraitsBonus.magicalResistance) {
            resistancePercent = weaponTraitsBonus.magicalResistance;
        } else if (!isMagic && weaponTraitsBonus.physicalResistance) {
            resistancePercent = weaponTraitsBonus.physicalResistance;
        }

        if (resistancePercent !== 0) {
            const multiplier = 1 - (resistancePercent / 100);
            finalDamage = finalDamage * multiplier;
        }

        // ダメージ軽減適用
        if (weaponTraitsBonus.damageReduction > 0) {
            const reductionMultiplier = 1 - (weaponTraitsBonus.damageReduction / 100);
            finalDamage = finalDamage * reductionMultiplier;
        }

        return Math.max(0, Math.round(finalDamage));
    }
}

