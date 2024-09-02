export const gridSubdivisionRatioMap: Record<string, number> = {
  ["1n"]: 0.25,
  ["2n"]: 0.5,
  ["2t"]: 0.75,
  ["4n"]: 1,
  ["4t"]: 1.5,
  ["8n"]: 2,
  ["8t"]: 3,
  ["16n"]: 4,
  ["16t"]: 6,
};

export const calculateGridLines = (
  timeSignature: number,
  totalMeasures: number,
  subdivision: string
) => {
  const totalBeats = totalMeasures * timeSignature;
  const subdivisionsPerBeat = gridSubdivisionRatioMap[subdivision];
  const totalGridLines = totalBeats * subdivisionsPerBeat;

  return { totalGridLines, subdivisionsPerBeat };
};
