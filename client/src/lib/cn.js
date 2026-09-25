/** Joins conditional class names without pulling in an extra dependency. */
export const cn = (...classes) => classes.filter(Boolean).join(' ');
