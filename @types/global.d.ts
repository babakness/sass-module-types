declare module 'postcss-icss-selectors'
declare module 'postcss-nested'
declare module 'strip-css-singleline-comments/sync'

declare module 'icss-utils' {
  import { Root } from 'postcss';
  interface IICSSExports {
    [exportName: string]: string;
  }
  export const extractICSS: (
    css: Root,
    removeRules?: boolean,
  ) => {
    icssExports: IICSSExports;
  };
}