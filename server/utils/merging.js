import { COLOR_ADJECTIVES, STYLE_PALETTES } from '../config/constants.js';

/**
 * Merge multiple user profiles with weighted preferences
 * @param {Array} userProfiles - Array of UserStyleProfile objects
 * @param {Object} weights - Map of userId to weight (must sum to 1.0)
 * @returns {Object} Merged profile
 */
export const mergeGroupProfiles = (userProfiles, weights) => {
    // Initialize merged scores
    const mergedStyleScores = {
        minimalist: 0,
        bohemian: 0,
        scandinavian: 0,
        industrial: 0,
        'modern-luxury': 0,
        traditional: 0,
        maximalist: 0
    };

    const mergedColorScores = {};
    const mergedMaterialScores = {};

    // Apply weighted merge for each style
    userProfiles.forEach(profile => {
        const userId = profile.user_id.toString();
        const weight = weights[userId] || 0;

        // Merge style scores
        Object.keys(mergedStyleScores).forEach(style => {
            mergedStyleScores[style] += (profile.raw_scores[style] || 0) * weight;
        });

        // Merge color scores
        const colorScoresObj = profile.color_scores instanceof Map ?
            Object.fromEntries(profile.color_scores) : profile.color_scores;

        Object.entries(colorScoresObj || {}).forEach(([color, score]) => {
            mergedColorScores[color] = (mergedColorScores[color] || 0) + (score * weight);
        });

        // Merge material scores
        const materialScoresObj = profile.material_scores instanceof Map ?
            Object.fromEntries(profile.material_scores) : profile.material_scores;

        Object.entries(materialScoresObj || {}).forEach(([material, score]) => {
            mergedMaterialScores[material] = (mergedMaterialScores[material] || 0) + (score * weight);
        });
    });

    // Find dominant styles
    const sortedStyles = Object.entries(mergedStyleScores)
        .sort((a, b) => b[1] - a[1]);

    const [primaryStyle, primaryScore] = sortedStyles[0];
    const [secondaryStyle, secondaryScore] = sortedStyles[1] || [null, 0];

    // Find dominant color and material
    const dominantColor = Object.keys(mergedColorScores).reduce((a, b) =>
        mergedColorScores[a] > mergedColorScores[b] ? a : b, 'neutral');

    const dominantMaterial = Object.keys(mergedMaterialScores).reduce((a, b) =>
        mergedMaterialScores[a] > mergedMaterialScores[b] ? a : b, 'wood');

    // Generate hybrid label (same logic as individual scoring)
    let styleLabel;
    if (secondaryStyle && (primaryScore - secondaryScore <= 5)) {
        const primary = primaryStyle.split('-').map(w =>
            w.charAt(0).toUpperCase() + w.slice(1)).join('-');
        const secondary = secondaryStyle.split('-').map(w =>
            w.charAt(0).toUpperCase() + w.slice(1)).join('-');
        styleLabel = `${primary}-${secondary} Fusion`;
    } else {
        const adjective = COLOR_ADJECTIVES[dominantColor] || 'Modern';
        const styleName = primaryStyle.split('-').map(w =>
            w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        styleLabel = `${adjective} ${styleName}`;
    }

    // Get color palette
    const colorPalette = STYLE_PALETTES[primaryStyle]?.[dominantColor] ||
        STYLE_PALETTES[primaryStyle]?.neutral ||
        ['#F5F5F5', '#E0E0E0', '#BDBDBD'];

    return {
        raw_scores: mergedStyleScores,
        color_scores: mergedColorScores,
        material_scores: mergedMaterialScores,
        primary_style: primaryStyle,
        secondary_style: secondaryStyle,
        style_label: styleLabel,
        dominant_color: dominantColor,
        dominant_material: dominantMaterial,
        color_palette: colorPalette
    };
};
