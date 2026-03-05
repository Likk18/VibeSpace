import { QUIZ_WEIGHTS, COLOR_ADJECTIVES, STYLE_PALETTES } from '../config/constants.js';

/**
 * Calculate style profile from quiz responses
 * @param {Array} responses - Array of 25 quiz responses
 * @returns {Object} Complete style profile
 */
export const calculateStyleProfile = (responses) => {
    // Initialize score objects
    const styleScore = {
        minimalist: 0,
        bohemian: 0,
        scandinavian: 0,
        industrial: 0,
        'modern-luxury': 0,
        traditional: 0,
        maximalist: 0
    };

    const colorScore = {};
    const materialScore = {};

    // Calculate scores from responses
    responses.forEach(response => {
        if (response.selected_style) {
            styleScore[response.selected_style] =
                (styleScore[response.selected_style] || 0) + QUIZ_WEIGHTS.STYLE;
        }

        if (response.selected_color) {
            colorScore[response.selected_color] =
                (colorScore[response.selected_color] || 0) + QUIZ_WEIGHTS.COLOR;
        }

        if (response.selected_material) {
            materialScore[response.selected_material] =
                (materialScore[response.selected_material] || 0) + QUIZ_WEIGHTS.MATERIAL;
        }
    });

    // Find dominant and secondary styles
    const sortedStyles = Object.entries(styleScore)
        .sort((a, b) => b[1] - a[1]);

    const [primaryStyle, primaryScore] = sortedStyles[0];
    const [secondaryStyle, secondaryScore] = sortedStyles[1] || [null, 0];

    // Find dominant color and material
    const dominantColor = Object.keys(colorScore).reduce((a, b) =>
        colorScore[a] > colorScore[b] ? a : b, 'neutral');

    const dominantMaterial = Object.keys(materialScore).reduce((a, b) =>
        materialScore[a] > materialScore[b] ? a : b, 'wood');

    // Generate hybrid label
    let styleLabel;
    if (secondaryStyle && (primaryScore - secondaryScore <= 5)) {
        // Fusion label for close scores
        const primary = primaryStyle.split('-').map(w =>
            w.charAt(0).toUpperCase() + w.slice(1)).join('-');
        const secondary = secondaryStyle.split('-').map(w =>
            w.charAt(0).toUpperCase() + w.slice(1)).join('-');
        styleLabel = `${primary}-${secondary} Fusion`;
    } else {
        // Adjective + dominant style
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
        raw_scores: styleScore,
        color_scores: colorScore,
        material_scores: materialScore,
        primary_style: primaryStyle,
        secondary_style: secondaryStyle,
        style_label: styleLabel,
        dominant_color: dominantColor,
        dominant_material: dominantMaterial,
        color_palette: colorPalette
    };
};

/**
 * Capitalize style name for display
 */
export const capitalizeStyle = (style) => {
    return style.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};
