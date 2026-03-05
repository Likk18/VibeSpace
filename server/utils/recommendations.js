import { MATCH_WEIGHTS } from '../config/constants.js';

/**
 * Calculate match score between product and user profile
 * @param {Object} product - Product document
 * @param {Object} profile - UserStyleProfile or GroupStyleProfile
 * @returns {Number} Match score (0-13)
 */
export const calculateMatchScore = (product, profile) => {
    let score = 0;

    // Primary style match (+5)
    if (product.style_tags.includes(profile.primary_style)) {
        score += MATCH_WEIGHTS.PRIMARY_STYLE;
    }

    // Secondary style match (+3)
    if (profile.secondary_style && product.style_tags.includes(profile.secondary_style)) {
        score += MATCH_WEIGHTS.SECONDARY_STYLE;
    }

    // Color match (+3)
    if (product.color_tag === profile.dominant_color) {
        score += MATCH_WEIGHTS.COLOR_MATCH;
    }

    // Material match (+2)
    if (product.material_tag === profile.dominant_material) {
        score += MATCH_WEIGHTS.MATERIAL_MATCH;
    }

    return score;
};

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
