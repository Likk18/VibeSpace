// Design Styles Taxonomy
export const DESIGN_STYLES = [
    'minimalist',
    'bohemian',
    'scandinavian',
    'industrial',
    'modern-luxury',
    'traditional',
    'maximalist'
];

// Color Adjective Mapping for Hybrid Labels
export const COLOR_ADJECTIVES = {
    neutral: 'Warm',
    earthy: 'Earthy',
    dark: 'Moody',
    'warm-metallic': 'Gilded',
    cool: 'Cool',
    bold: 'Bold',
    soft: 'Soft'
};

// Style-Based Color Palettes (Hex Arrays)
export const STYLE_PALETTES = {
    minimalist: {
        neutral: ['#F5F5F5', '#E0E0E0', '#BDBDBD'],
        cool: ['#ECEFF1', '#CFD8DC', '#B0BEC5'],
        dark: ['#424242', '#616161', '#757575']
    },
    bohemian: {
        earthy: ['#D7CCC8', '#BCAAA4', '#A1887F'],
        bold: ['#E8845A', '#D4735E', '#C06262'],
        neutral: ['#F5F0EB', '#E8DDD2', '#D4C4B0']
    },
    scandinavian: {
        neutral: ['#FAFAFA', '#F5F5F5', '#EEEEEE'],
        cool: ['#E8F5E9', '#C8E6C9', '#A5D6A7'],
        'warm-metallic': ['#FFF8E1', '#FFECB3', '#FFE082']
    },
    industrial: {
        dark: ['#37474F', '#455A64', '#546E7A'],
        neutral: ['#78909C', '#90A4AE', '#B0BEC5'],
        earthy: ['#8D6E63', '#A1887F', '#BCAAA4']
    },
    'modern-luxury': {
        'warm-metallic': ['#FFF3E0', '#FFE0B2', '#FFCC80'],
        dark: ['#1A1A1A', '#2C2C2C', '#3E3E3E'],
        bold: ['#C2185B', '#D81B60', '#E91E63']
    },
    traditional: {
        earthy: ['#8D6E63', '#A1887F', '#BCAAA4'],
        dark: ['#4E342E', '#5D4037', '#6D4C41'],
        neutral: ['#EFEBE9', '#D7CCC8', '#BCAAA4']
    },
    maximalist: {
        bold: ['#E91E63', '#9C27B0', '#673AB7'],
        'warm-metallic': ['#FFD700', '#FFC107', '#FF9800'],
        earthy: ['#FF5722', '#FF7043', '#FF8A65']
    }
};

// Quiz Question Categories
export const QUIZ_CATEGORIES = {
    BEDROOM: 'bedroom',
    OBJECT: 'object',
    TEXTURE: 'texture',
    COLOR: 'color',
    OVERALL_ROOM: 'overall_room',
    DIY: 'diy',
    LAMP_FIXTURE: 'lamp_fixture',
    RUG: 'rug'
};

// Mode Labels for Multi-User
export const MODE_LABELS = {
    SINGLE: 'single',
    PARTNER: 'partner',
    ROOMMATES: 'roommates',
    FAMILY: 'family',
    CUSTOM: 'custom'
};

// Default Weights by Mode
export const DEFAULT_WEIGHTS = {
    partner: { default: 0.5 },
    roommates: { default: 0.5 },
    family: { adult: 0.7, child: 0.3 },
    custom: { default: 0.5 }
};

// Match Scoring Weights
export const MATCH_WEIGHTS = {
    PRIMARY_STYLE: 5,
    SECONDARY_STYLE: 3,
    COLOR_MATCH: 3
};

// Quiz Scoring Weights
export const QUIZ_WEIGHTS = {
    STYLE: 2,
    COLOR: 1
};
