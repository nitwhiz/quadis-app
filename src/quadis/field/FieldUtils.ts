const BITS_PER_TOKEN = 4;
const TOKENS_PER_BYTE = 8 / BITS_PER_TOKEN;

const BITS_PER_WORD = 64;
const TOKENS_PER_WORD = (BITS_PER_WORD / 8) * TOKENS_PER_BYTE;

export const encodeField = (
  data: Uint8Array,
  width: number,
  height: number,
): string[] => {
  let dataBuf = 0n;
  let tokenIndex = 0;

  const words = [];

  for (let y = height - 1; y >= 0; --y) {
    for (let x = width - 1; x >= 0; --x) {
      const i = y * width + x;

      dataBuf = BigInt.asUintN(
        BITS_PER_WORD,
        dataBuf |
          BigInt.asUintN(
            BITS_PER_WORD,
            BigInt.asUintN(BITS_PER_WORD, BigInt(data[i] & 0xf)) <<
              BigInt.asUintN(BITS_PER_WORD, BigInt(tokenIndex * 4)),
          ),
      );

      ++tokenIndex;

      if (tokenIndex === TOKENS_PER_WORD || i === 0) {
        words.unshift(dataBuf.toString(16).padStart(16, '0'));

        dataBuf = 0n;
        tokenIndex = 0;
      }
    }
  }

  return words;
};

export const decodeField = (
  width: number,
  height: number,
  words: string,
): number[] => {
  let tokenCount = width * height;

  const result: number[] = [];

  const data = new BigUint64Array(
    words
      .split(' ')
      .reverse()
      .map((o) => BigInt.asUintN(BITS_PER_WORD, BigInt(`0x${o}`))),
  );
  const dataView = new Uint8Array(data.buffer).reverse();

  for (let ptr = dataView.length - 1; ptr >= 0; --ptr) {
    const tokA = dataView[ptr] & 0x0f;
    const tokB = (dataView[ptr] & 0xf0) >> 4;

    result.unshift(tokA);

    --tokenCount;

    if (tokenCount > 0) {
      result.unshift(tokB);
    }

    --tokenCount;

    if (tokenCount <= 0) {
      break;
    }
  }

  return result;
};
