import type { RomanNumeralAnalysis } from "../../types";

export function groupAnalysisByMeasuresReduce(
  analysis: RomanNumeralAnalysis[]
): RomanNumeralAnalysis[][] {
  const sortedAnalysis = analysis.sort((a, b) => {
    if (a.measure !== b.measure) {
      return a.measure - b.measure;
    }
    return a.beat - b.beat;
  });

  const grouped = sortedAnalysis.reduce((acc, item) => {
    const measureIndex = acc.findIndex(
      (group) => group.length > 0 && group[0].measure === item.measure
    );

    if (measureIndex === -1) {
      acc.push([item]);
    } else {
      acc[measureIndex].push(item);
    }

    return acc;
  }, [] as RomanNumeralAnalysis[][]);

  return grouped;
}
