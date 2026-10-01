/**
 * Flat, readable query strings for nested form state:
 *   { store: { name: 'A' }, items: [{ title: 'B' }] } ⇄ ?store.name=A&items.0.title=B
 */

type TPlain = Record<string, any>;

const isPlainObject = (value: unknown): value is TPlain =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const flattenToQuery = (
  value: unknown,
  { skip }: { skip?: (path: string, value: unknown) => boolean } = {},
) => {
  const params = new URLSearchParams();
  const walk = (node: unknown, path: string) => {
    if (Array.isArray(node)) {
      node.forEach((child, index) => walk(child, path ? `${path}.${index}` : String(index)));
      return;
    }
    if (isPlainObject(node)) {
      Object.entries(node).forEach(([key, child]) => walk(child, path ? `${path}.${key}` : key));
      return;
    }
    if (node === undefined || node === null || node === '') return;
    if (skip?.(path, node)) return;
    params.set(path, String(node));
  };
  walk(value, '');
  return params;
};

/**
 * Rebuilds the nested object. Values are coerced to the type found at the same path in
 * `reference` (numbers, booleans); numeric path segments become array indexes.
 */
export const unflattenQuery = (params: URLSearchParams, reference: TPlain = {}) => {
  const result: TPlain = {};

  const referenceAt = (segments: string[]) =>
    segments.reduce<any>((node, segment) => {
      if (Array.isArray(node)) return node[Number(segment)] ?? node[0];
      return isPlainObject(node) ? node[segment] : undefined;
    }, reference);

  const coerce = (raw: string, sample: unknown) => {
    if (typeof sample === 'number') {
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : sample;
    }
    if (typeof sample === 'boolean') return raw === 'true';
    return raw;
  };

  params.forEach((raw, path) => {
    const segments = path.split('.');
    let node: any = result;
    segments.forEach((segment, index) => {
      const last = index === segments.length - 1;
      const nextIsIndex = /^\d+$/.test(segments[index + 1] ?? '');
      const key = Array.isArray(node) ? Number(segment) : segment;
      if (last) {
        node[key] = coerce(raw, referenceAt(segments));
      } else {
        node[key] ??= nextIsIndex ? [] : {};
        node = node[key];
      }
    });
  });

  // drop holes left by skipped indexes (e.g. items.0 and items.2 only)
  const compact = (node: any): any => {
    if (Array.isArray(node)) return node.filter((item) => item !== undefined).map(compact);
    if (isPlainObject(node)) {
      return Object.fromEntries(Object.entries(node).map(([key, child]) => [key, compact(child)]));
    }
    return node;
  };

  return compact(result) as TPlain;
};
