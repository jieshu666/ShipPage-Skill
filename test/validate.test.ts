import { describe, it, expect } from 'vitest';
import {
  isValidSlug, isReservedSlug, clampTtl, safeRedirectPath,
  MAX_TTL_SECONDS, MIN_TTL_SECONDS,
} from '../src/utils/validate';

describe('isValidSlug', () => {
  it('accepts lowercase alphanumerics and hyphens', () => {
    expect(isValidSlug('abc')).toBe(true);
    expect(isValidSlug('my-page-1')).toBe(true);
    expect(isValidSlug('a')).toBe(true);
    expect(isValidSlug('a'.repeat(64))).toBe(true);
  });
  it('rejects traversal, separators, and unsafe chars', () => {
    expect(isValidSlug('../evil')).toBe(false);
    expect(isValidSlug('a/b')).toBe(false);
    expect(isValidSlug('a.b')).toBe(false);
    expect(isValidSlug('UPPER')).toBe(false);
    expect(isValidSlug('has space')).toBe(false);
    expect(isValidSlug('emoji😀')).toBe(false);
  });
  it('rejects empty and over-length', () => {
    expect(isValidSlug('')).toBe(false);
    expect(isValidSlug('a'.repeat(65))).toBe(false);
  });
  it('rejects non-strings', () => {
    expect(isValidSlug(undefined)).toBe(false);
    expect(isValidSlug(123)).toBe(false);
    expect(isValidSlug(null)).toBe(false);
  });
});

describe('isReservedSlug', () => {
  it('flags top-level route names', () => {
    for (const s of ['account', 'auth', 'claim', 'docs', 'pricing', 'v1', 'terms']) {
      expect(isReservedSlug(s)).toBe(true);
    }
  });
  it('allows ordinary slugs', () => {
    expect(isReservedSlug('my-report')).toBe(false);
    expect(isReservedSlug('x7k2m9')).toBe(false);
  });
});

describe('clampTtl', () => {
  it('defaults to the 14-day max when unset', () => {
    expect(clampTtl(undefined)).toBe(MAX_TTL_SECONDS);
  });
  it('clamps a huge value down to the max (no permanent pages)', () => {
    expect(clampTtl(3_153_600_000)).toBe(MAX_TTL_SECONDS);
  });
  it('clamps a tiny value up to the min', () => {
    expect(clampTtl(1)).toBe(MIN_TTL_SECONDS);
  });
  it('passes through an in-range value (floored)', () => {
    expect(clampTtl(3600)).toBe(3600);
    expect(clampTtl(3600.9)).toBe(3600);
  });
  it('returns null for non-positive or non-finite input', () => {
    expect(clampTtl(0)).toBeNull();
    expect(clampTtl(-5)).toBeNull();
    expect(clampTtl('abc')).toBeNull();
    expect(clampTtl(Infinity)).toBeNull();
  });
});

describe('safeRedirectPath', () => {
  it('allows same-origin relative paths', () => {
    expect(safeRedirectPath('/claim/ABCD-1234')).toBe('/claim/ABCD-1234');
    expect(safeRedirectPath('/account')).toBe('/account');
  });
  it('blocks protocol-relative and absolute URLs', () => {
    expect(safeRedirectPath('//evil.com')).toBe('/');
    expect(safeRedirectPath('https://evil.com')).toBe('/');
    expect(safeRedirectPath('http://evil.com')).toBe('/');
  });
  it('blocks backslash smuggling and non-slash input', () => {
    expect(safeRedirectPath('/\\evil.com')).toBe('/');
    expect(safeRedirectPath('evil')).toBe('/');
  });
  it('falls back to / for empty or non-string', () => {
    expect(safeRedirectPath('')).toBe('/');
    expect(safeRedirectPath(undefined)).toBe('/');
    expect(safeRedirectPath(null)).toBe('/');
  });
});
