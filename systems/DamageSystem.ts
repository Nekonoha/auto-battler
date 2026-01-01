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
}
