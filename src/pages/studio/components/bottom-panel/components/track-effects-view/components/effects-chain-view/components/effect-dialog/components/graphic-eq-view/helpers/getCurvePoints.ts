import { Band } from "@/pages/studio/audio-engine/components/effects/graphic-eq/components";
import { getBeforeAndAfterPoints } from ".";
import { Point } from "../types";

function calculateYValueFromXDifference(
  startX: number,
  endX: number,
  domainX: [number, number] = [20, 20000],
  domainY: [number, number] = [-12, 12]
): number {
  const ratioX = endX / startX;

  const logRangeX = Math.log10(domainX[1]) - Math.log10(domainX[0]);

  const rangeY = domainY[1] - domainY[0];

  const proportionX = Math.log10(ratioX) / logRangeX;

  const movementY = proportionX * rangeY;

  return movementY;
}

const applyHighPassAdjustment = (
  points: Point[],
  currentPoint: Point,
  i: number
) => {
  for (let j = i + 1; j < points.length; j++) {
    if (points[j].frequency <= currentPoint.frequency) {
      const nextRealPoint = points.find(
        (point, k) => point.type !== "marker" && k > j
      );
      if (nextRealPoint) {
        const nextRealPointIndex = points.indexOf(nextRealPoint);
        const nextRealPointInitialGain = nextRealPoint.gain;

        if (nextRealPointIndex - j === 1 && nextRealPointInitialGain > 0) {
          nextRealPoint.gain += calculateYValueFromXDifference(
            currentPoint.frequency,
            points[j].frequency
          );
          if (
            nextRealPoint.frequency < points[nextRealPointIndex + 1].frequency
          ) {
            nextRealPoint.frequency +=
              currentPoint.frequency - points[j].frequency;
          }

          if (nextRealPointInitialGain > 0 && nextRealPoint.gain < 0) {
            nextRealPoint.gain = 0;
          }

          if (points[j].frequency < points[nextRealPointIndex + 1].frequency) {
            points[j].frequency = currentPoint.frequency;
          }

          if (nextRealPoint.frequency < currentPoint.frequency) {
            nextRealPoint.frequency = currentPoint.frequency;
          }

          if (
            nextRealPoint.frequency > points[nextRealPointIndex + 1].frequency
          ) {
            nextRealPoint.frequency = points[nextRealPointIndex + 1].frequency;
          }

          if (
            points[nextRealPointIndex - 1].frequency >=
            points[nextRealPointIndex + 1].frequency
          ) {
            points[nextRealPointIndex + 1].gain = 0;
            nextRealPoint.gain = 0;
          }
        }
      }
    }
  }
};

const adjustCurvePoints = (points: Point[]) => {
  return points.map((point, i) => {
    if (point.type === "highpass") {
      applyHighPassAdjustment(points, point, i);
    }
    return point;
  });
};

export const getCurvePoints = (bands: Band[]) => {
  const twoDArray = bands.map((band) => getBeforeAndAfterPoints(band));
  const centerLine: Point[] = [
    { frequency: 1, gain: 0, type: "marker" },
    { frequency: 45000, gain: 0, type: "marker" },
  ];

  return adjustCurvePoints([...twoDArray, ...centerLine].flat());
};
