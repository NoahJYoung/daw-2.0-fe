export type Range = [number, number];

export const clamp = (range: [number, number], value: number) => {
  const [min, max] = range;
  return Math.max(min, Math.min(max, value));
};
