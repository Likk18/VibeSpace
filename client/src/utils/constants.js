// Style color palettes (matching backend constants)
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

// Quiz scoring weights
export const QUIZ_WEIGHTS = {
    STYLE: 2,
    COLOR: 1,
    MATERIAL: 1
};

// Mode labels
export const MODE_LABELS = {
    SINGLE: 'single',
    GROUP: 'group'
};

// Group mode types
export const GROUP_MODES = [
    { value: 'partner', label: 'Me + Partner', description: 'Design together with your significant other', minMembers: 2, maxMembers: 2 },
    { value: 'family', label: 'Me + Family', description: 'Find a style that works for the whole family', minMembers: 2, maxMembers: 6 }
];

// Default weights based on mode
export const DEFAULT_WEIGHTS = {
    partner: { primary: 0.6, secondary: 0.4 },
    family: { primary: 0.5 }
};

// Weight options
export const WEIGHT_OPTIONS = [
    { value: [0.5, 0.5], label: '50-50', description: 'Equal preferences' },
    { value: [0.6, 0.4], label: '60-40', description: 'Slightly favor first person' },
    { value: [0.7, 0.3], label: '70-30', description: 'Strongly favor first person' }
];
