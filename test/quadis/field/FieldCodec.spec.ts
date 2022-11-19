import { expect, test } from 'vitest';
import { decode64, encode64 } from '../../../src/quadis/field/FieldCodec';

test('encode empty field', () => {
  const field = new Uint8Array(
    // prettier-ignore
    [
      0, 0, 0,
      0, 0, 0,
      0, 0, 0,
      0, 0, 0,
    ],
  );

  const e = encode64(field, 3, 4).join(' ');

  expect(e).toBe('0000000000000000');
});

test('encode w/ first token', () => {
  const field = new Uint8Array(
    // prettier-ignore
    [
      1, 0, 0,
      0, 0, 0,
      0, 0, 0,
      0, 0, 0,
    ],
  );

  const e = encode64(field, 3, 4).join(' ');

  expect(e).toBe('0000100000000000');
});

test('encode w/ last token', () => {
  const field = new Uint8Array(
    // prettier-ignore
    [
      0, 0, 0,
      0, 0, 0,
      0, 0, 0,
      0, 0, 1,
    ],
  );

  const e = encode64(field, 3, 4).join(' ');

  expect(e).toBe('0000000000000001');
});

test('encode w/ all tokens', () => {
  const field = new Uint8Array(
    // prettier-ignore
    [
      1, 2, 3,
      4, 5, 6,
      7, 8, 1,
      2, 3, 4,
    ],
  );

  const e = encode64(field, 3, 4).join(' ');

  expect(e).toBe('0000123456781234');
});

test('encode w/ big field', () => {
  const field = new Uint8Array(
    // prettier-ignore
    [
      1, 2, 3,
      4, 5, 6,
      7, 8, 1,
      2, 3, 4,
      5, 6, 7,
      8, 1, 2,
      3, 4, 5,
      6, 7, 8,
      1, 2, 3,
      4, 5, 6,
      7, 8, 1,
      2, 3, 4,
      5, 6, 7,
      8, 1, 2,
    ],
  );

  const e = encode64(field, 3, 14).join(' ');

  expect(e).toBe('0000001234567812 3456781234567812 3456781234567812');
});

test('decode w/ last token', () => {
  const d = decode64(3, 4, '0000000000000001');

  expect(d).toStrictEqual(
    // prettier-ignore
    [
      0, 0, 0,
      0, 0, 0,
      0, 0, 0,
      0, 0, 1,
    ],
  );
});

test('decode w/ all tokens', () => {
  const d = decode64(3, 4, '0000123456781234');

  expect(d).toStrictEqual(
    // prettier-ignore
    [
      1, 2, 3,
      4, 5, 6,
      7, 8, 1,
      2, 3, 4,
    ],
  );
});

test('decode w/ big field', () => {
  const d = decode64(
    3,
    14,
    '0000001234567812 3456781234567812 3456781234567812',
  );

  expect(d).toStrictEqual(
    // prettier-ignore
    [
      1, 2, 3,
      4, 5, 6,
      7, 8, 1,
      2, 3, 4,
      5, 6, 7,
      8, 1, 2,
      3, 4, 5,
      6, 7, 8,
      1, 2, 3,
      4, 5, 6,
      7, 8, 1,
      2, 3, 4,
      5, 6, 7,
      8, 1, 2,
    ],
  );
});
