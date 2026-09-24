// Utility types and functions for generation

export type GeneratorMode = 'password' | 'key-hex' | 'key-base64';

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  avoidAmbiguous: boolean;
}

const AMBIGUOUS_CHARS = ['0', 'O', 'I', 'l', '1'];

const CHARSET = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  number: '0123456789',
  symbol: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

/** Unbiased random integer in [0, max) using rejection sampling (plain `% max` favours low values). */
export const randomInt = (max: number): number => {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
};

const stripAmbiguous = (chars: string, avoid: boolean) =>
  avoid ? [...chars].filter(c => !AMBIGUOUS_CHARS.includes(c)).join('') : chars;

export const getPasswordPools = (options: PasswordOptions): string[] =>
  [
    options.uppercase && CHARSET.upper,
    options.lowercase && CHARSET.lower,
    options.numbers && CHARSET.number,
    options.symbols && CHARSET.symbol,
  ]
    .filter((p): p is string => Boolean(p))
    .map(p => stripAmbiguous(p, options.avoidAmbiguous))
    .filter(p => p.length > 0);

export const generatePassword = (options: PasswordOptions): string => {
  const pools = getPasswordPools(options);
  if (pools.length === 0 || options.length <= 0) return '';
  const all = pools.join('');

  // one character from every selected class, the rest from the combined pool
  const chars = pools.slice(0, options.length).map(p => p[randomInt(p.length)]);
  while (chars.length < options.length) chars.push(all[randomInt(all.length)]);

  // Fisher-Yates shuffle so the guaranteed characters are not always at the start
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
};

export const generateKey = (length: number, type: 'hex' | 'base64'): string => {
  const cryptoObj = window.crypto;
  // length in bytes roughly correlates to characters but structure varies. 
  // For simplicity in UI, we interpret length as the number of random bytes to generate.
  const array = new Uint8Array(length);
  cryptoObj.getRandomValues(array);

  if (type === 'hex') {
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } else {
    // type === 'base64'
    let binary = '';
    const len = array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(array[i]);
    }
    return window.btoa(binary);
  }
};

/** Entropy in bits of a password produced by this generator with the given options. */
export const passwordEntropyBits = (options: PasswordOptions): number => {
  const size = getPasswordPools(options).join('').length;
  return size > 1 ? options.length * Math.log2(size) : 0;
};

export type Strength = 'อ่อน' | 'ปานกลาง' | 'แข็งแกร่ง';

/** < 50 bits weak, < 80 bits medium, otherwise strong. */
export const calculateStrength = (bits: number): Strength =>
  bits >= 80 ? 'แข็งแกร่ง' : bits >= 50 ? 'ปานกลาง' : 'อ่อน';
