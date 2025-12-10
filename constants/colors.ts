import { gray, primary, success, warning, error } from './palette';

export type ColorMode = 'light' | 'dark';

/* -------------------------------------------------------------------------- */
/*                               Base Palette                                 */
/* -------------------------------------------------------------------------- */

export const palette = {
  gray,
  primary,
  success,
  warning,
  error,
  // TODO: secondary / success / warning / error …
} as const;

/* -------------------------------------------------------------------------- */
/*                            Semantic Color Tokens                            */
/* -------------------------------------------------------------------------- */

export const semantic = {
  light: {
    text: {
      default: palette.gray[900],
      secondary: palette.gray[400],
      inverse: palette.gray[0],
    },
    bg: {
      default: palette.gray[50],
      subtle: palette.gray[100],
    },
    brand: {
      primary: palette.primary[500],
      primaryHover: palette.primary[600],
    },
    border: {
      default: palette.gray[200],
    },
  },
  dark: {
    text: {
      default: palette.gray[100],
      secondary: palette.gray[500],
      inverse: palette.gray[900],
    },
    bg: {
      default: palette.gray[900],
      subtle: palette.gray[800],
    },
    brand: {
      primary: palette.primary[500],
      primaryHover: palette.primary[400],
    },
    border: {
      default: palette.gray[700],
    },
  },
} as const;

/* -------------------------------------------------------------------------- */
/*                   Backward-Compatible Flat Colors Object                   */
/* -------------------------------------------------------------------------- */

function flatten(mode: ColorMode) {
  return {
    /** flat convenience props (keep legacy naming) */
    text: semantic[mode].text.default,
    background: semantic[mode].bg.default,
    tint: semantic[mode].brand.primary,
    /** nested semantic tokens */
    tokens: semantic[mode],
  } as const;
}

const Colors = {
  light: flatten('light'),
  dark: flatten('dark'),
} as const;

export default Colors;
