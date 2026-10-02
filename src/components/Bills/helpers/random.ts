/** Deterministic PRNG so the same seed always yields the same QR/barcode/codes. */
const hashSeed = (seed: string) => {
  let hash = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(hash ^ seed.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return hash >>> 0;
};

export const createRandom = (seed: string) => {
  let state = hashSeed(seed || 'receipt-lab');
  const next = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min;

  const digits = (length: number) =>
    Array.from({ length }, (_, i) => (i === 0 ? int(1, 9) : int(0, 9))).join('');

  const alphanumeric = (length: number) => {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length }, () => charset[int(0, charset.length - 1)]).join('');
  };

  return { next, int, digits, alphanumeric };
};

export const randomSeed = () => Math.random().toString(36).slice(2, 10);

/** EAN-13 with a valid check digit, so scanners in the OCR pipeline accept it. */
export const randomEan13 = (seed = randomSeed()) => {
  const random = createRandom(seed);
  const body = '893' + random.digits(9).slice(0, 9);
  const sum = body
    .split('')
    .reduce((acc, char, index) => acc + Number(char) * (index % 2 === 0 ? 1 : 3), 0);
  return body + ((10 - (sum % 10)) % 10);
};

/**
 * Fills a user-typed mask: `#` digit, `A` A–Z, `a` a–z, `*` letter or digit, `\x` literal x;
 * anything else prints as typed. Empty mask → a generic 12-character ID.
 */
export const fillIdMask = (mask = '', seed = randomSeed()) => {
  const random = createRandom(seed);
  const pick = (charset: string) => charset[random.int(0, charset.length - 1)];
  const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const DIGITS = '0123456789';
  if (!mask.trim()) return random.alphanumeric(12);

  let out = '';
  for (let i = 0; i < mask.length; i++) {
    const char = mask[i];
    if (char === '\\' && i + 1 < mask.length) out += mask[++i];
    else if (char === '#') out += pick(DIGITS);
    else if (char === 'A') out += pick(UPPER);
    else if (char === 'a') out += pick(UPPER.toLowerCase());
    else if (char === '*') out += pick(UPPER + DIGITS);
    else out += char;
  }
  return out;
};
