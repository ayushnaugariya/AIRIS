/**
 * plotly.js-dist-min ships as a pre-minified UMD bundle without types.
 * We type the surface we use via @types/plotly.js and treat this module
 * as untyped at its boundary.
 */
declare module "plotly.js-dist-min";
