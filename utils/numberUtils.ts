export const splitNumberIntoChunks = (number: number): number[] => {
  const chunks: number[] = [];
  while (number > 0) {
    const chunk = Math.min(number, 1000);
    chunks.push(chunk);
    number -= chunk;
  }
  return chunks;
};