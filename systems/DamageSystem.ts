import type { Enemy, Player } from '~/types';

export interface DamageReductionInfo {
    baseDamage: number;
    finalDamage: number;
    physicalResistanceApplied: number;
    magicalResistanceApplied: number;
    damageReductionApplied: number;
    totalReduction: number;
}

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
     * 敵の耐性には上限がない（プレイヤーが無敵になれないという制限のため）
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
        weaponType?: string,
        attackerResistancePenetration = 0
    ): { damage: number; resistanceApplied: number; blocked: boolean; penetrationLog?: string } {
        // 攻撃タイプ無効チェック
        if (weaponType && defender.traits?.attackImmunities?.includes(weaponType as any)) {
            return { damage: 0, resistanceApplied: 100, blocked: true };
        }

        // 通常の防御計算
        const defense = isMagic ? defender.stats.magicDefense : defender.stats.defense;
        let finalDamage = baseDamage * this.defenseMultiplier(defense);

        // 耐性適用（敵の耐性には上限がない）
        let resistancePercent = 0;
        if (isMagic && defender.traits?.magicalResistance) {
            resistancePercent = defender.traits.magicalResistance;
        } else if (!isMagic && defender.traits?.physicalResistance) {
            resistancePercent = defender.traits.physicalResistance;
        }

        // 攻撃側の耐性貫通効果を適用（相手の耐性を減らす）
        let penetrationLog: string | undefined;
        if (attackerResistancePenetration > 0 && resistancePercent > 0) {
            const resistanceBeforePenetration = resistancePercent;
            resistancePercent = Math.max(0, resistancePercent - attackerResistancePenetration);
            penetrationLog = `耐性貫通: ${resistanceBeforePenetration}% → ${resistancePercent}% (貫通量: ${attackerResistancePenetration}%)`;
        } else {
            resistancePercent = Math.max(0, resistancePercent - attackerResistancePenetration);
        }

        // 耐性によるダメージ軽減/増加
        if (resistancePercent !== 0) {
            const multiplier = 1 - (resistancePercent / 100);
            finalDamage = finalDamage * multiplier;
        }

        return { 
            damage: Math.max(0, Math.round(finalDamage)), 
            resistanceApplied: resistancePercent,
            blocked: false,
            penetrationLog
        };
    }

    /**
     * プレイヤーが受けるダメージに武器traitsを適用
     * @param baseDamage 基本ダメージ
     * @param player プレイヤー
     * @param isMagic 魔法攻撃かどうか
     * @param weaponTraitsBonus 装備武器からのtraitsボーナス
     * @returns 最終ダメージと軽減情報
     */
    static calculatePlayerDamageWithTraits(
        baseDamage: number,
        player: Player,
        isMagic: boolean,
        weaponTraitsBonus?: { 
            physicalResistance: number
            magicalResistance: number
            damageReduction: number
            resistancePenetration?: number
        },
        attackerResistancePenetration = 0
    ): { damage: number; reductionInfo: DamageReductionInfo; penetrationInfo?: { type: 'physical' | 'magical'; before: number; after: number; used: number } } {
        // 通常の防御計算
        const defense = isMagic ? player.stats.magicDefense : player.stats.defense;
        let finalDamage = baseDamage * this.defenseMultiplier(defense);

        let physicalResistance = 0;
        let magicalResistance = 0;
        let damageReduction = 0;
        const MAX_RESISTANCE = 70; // 各耐性の上限

        if (!weaponTraitsBonus) {
            return {
                damage: Math.round(finalDamage),
                reductionInfo: {
                    baseDamage,
                    finalDamage: Math.round(finalDamage),
                    physicalResistanceApplied: 0,
                    magicalResistanceApplied: 0,
                    damageReductionApplied: 0,
                    totalReduction: 0
                }
            };
        }

        // 耐性適用（各耐性は最大70%まで）
        // 攻撃側の耐性貫通を適用してから耐性軽減を計算
        let penetrationInfo: { type: 'physical' | 'magical'; before: number; after: number; used: number } | undefined

        if (isMagic && weaponTraitsBonus.magicalResistance) {
            const capped = Math.min(weaponTraitsBonus.magicalResistance, MAX_RESISTANCE)
            const afterPenetration = Math.max(0, capped - attackerResistancePenetration)
            penetrationInfo = attackerResistancePenetration > 0 ? { type: 'magical', before: capped, after: afterPenetration, used: capped - afterPenetration } : undefined
            magicalResistance = afterPenetration
            const multiplier = 1 - (magicalResistance / 100);
            finalDamage = finalDamage * multiplier;
        } else if (!isMagic && weaponTraitsBonus.physicalResistance) {
            const capped = Math.min(weaponTraitsBonus.physicalResistance, MAX_RESISTANCE)
            const afterPenetration = Math.max(0, capped - attackerResistancePenetration)
            penetrationInfo = attackerResistancePenetration > 0 ? { type: 'physical', before: capped, after: afterPenetration, used: capped - afterPenetration } : undefined
            physicalResistance = afterPenetration
            const multiplier = 1 - (physicalResistance / 100);
            finalDamage = finalDamage * multiplier;
        }

        // ダメージ軽減適用（最大70%まで）
        if (weaponTraitsBonus.damageReduction > 0) {
            damageReduction = Math.min(weaponTraitsBonus.damageReduction, MAX_RESISTANCE);
            const reductionMultiplier = 1 - (damageReduction / 100);
            finalDamage = finalDamage * reductionMultiplier;
        }

        // ダメージ軽減の上限を70%（最小30%のダメージは通す）
        const maxDamageReductionRate = 0.7;
        const minimumDamageMultiplier = 1 - maxDamageReductionRate;
        if (finalDamage < baseDamage * minimumDamageMultiplier) {
            finalDamage = baseDamage * minimumDamageMultiplier;
        }

        const actualFinalDamage = Math.max(0, Math.round(finalDamage));
        const totalReduction = baseDamage - actualFinalDamage;

        return {
            damage: actualFinalDamage,
            reductionInfo: {
                baseDamage,
                finalDamage: actualFinalDamage,
                physicalResistanceApplied: physicalResistance,
                magicalResistanceApplied: magicalResistance,
                damageReductionApplied: damageReduction,
                totalReduction
            },
            penetrationInfo
        };
    }
}

