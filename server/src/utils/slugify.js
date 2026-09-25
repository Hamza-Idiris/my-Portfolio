export function slugify(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Appends -2, -3 ... until the slug is free within the given model. */
export async function uniqueSlug(Model, base, excludeId) {
  const root = slugify(base) || 'item';
  let candidate = root;
  let suffix = 2;

  // eslint-disable-next-line no-await-in-loop -- sequential by nature
  while (
    await Model.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })
  ) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
