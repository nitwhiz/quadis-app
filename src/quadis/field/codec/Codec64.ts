import { MAX_TOKEN } from '../../piece/Piece';

class Codec64 {
  private static MAX_WORD_VALUE = BigInt.asUintN(
    64,
    BigInt.asUintN(64, 1n << 64n) - 1n,
  );

  private readonly bitsPerToken: bigint = 0n;

  private readonly tokenMask: bigint = 0n;

  private readonly tokensPerWord: bigint = 0n;

  private static getBitCount(n: bigint): bigint {
    let b = 1;

    for (
      let i = 1n;
      i < Codec64.MAX_WORD_VALUE;
      i = BigInt.asUintN(64, i * 2n)
    ) {
      if (i >= n) {
        break;
      }

      ++b;
    }

    return BigInt.asUintN(64, BigInt(b));
  }

  private static getMask(b: bigint): bigint {
    return BigInt.asUintN(64, BigInt.asUintN(64, 1n << b) - 1n);
  }

  constructor() {
    const bitsPerWord = 64n;

    this.bitsPerToken = Codec64.getBitCount(BigInt(MAX_TOKEN));
    this.tokenMask = Codec64.getMask(BigInt(this.bitsPerToken));
    this.tokensPerWord = BigInt.asUintN(64, bitsPerWord / this.bitsPerToken);
  }

  public encode(data: Uint8Array, width: number, height: number): string[] {
    let buf = 0n;
    let tokenIndex = 0n;

    const words: string[] = [];

    for (let y = height - 1; y >= 0; --y) {
      for (let x = width - 1; x >= 0; --x) {
        const i = y * width + x;

        buf = BigInt.asUintN(
          64,
          buf |
            BigInt.asUintN(
              64,
              BigInt.asUintN(64, BigInt(data[i]) & this.tokenMask) <<
                BigInt.asUintN(64, tokenIndex * this.bitsPerToken),
            ),
        );

        ++tokenIndex;

        if (tokenIndex === this.tokensPerWord || i === 0) {
          words.unshift(buf.toString(16).padStart(16, '0'));

          buf = 0n;
          tokenIndex = 0n;
        }
      }
    }

    return words;
  }

  public decode(width: number, height: number, words: string): number[] {
    const ws = words.split(' ');

    const result = new Array<number>(width * height).fill(0);

    let offset =
      BigInt(ws.length) * this.tokensPerWord - BigInt(width * height);
    let fieldPtr = 0;

    for (const w of ws) {
      const w64 = BigInt(`0x${w}`);

      for (let i = this.tokensPerWord - 1n - offset; i >= 0; --i) {
        const shift = i * this.bitsPerToken;
        const tok = BigInt.asUintN(
          64,
          (w64 & (this.tokenMask << shift)) >> shift,
        );

        result[fieldPtr] = Number(tok);

        ++fieldPtr;
      }

      if (offset > 0) {
        offset = BigInt(Math.max(0, Number(offset - this.tokensPerWord)));
      }
    }

    return result;
  }
}

export const codec64 = new Codec64();
