export function formatRomanNumeral(
  degree: number,
  quality: string,
  mode: "major" | "minor"
): string {
  const minorQualities = ["Minor", "Diminished"];
  const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"];
  const base = romanNumerals[degree - 1];
  const lowerCase = minorQualities.includes(quality) ? true : false;

  if (!base) return "?";

  const isMinorChord = quality === "minor";
  const isDiminished = quality === "diminished";
  const isAugmented = quality === "augmented";

  let result = base;

  if (mode === "major") {
    const naturalMinor = [2, 3, 6, 7].includes(degree);

    if (
      (naturalMinor && !isMinorChord) ||
      (!naturalMinor && isMinorChord && !isDiminished)
    ) {
      result = naturalMinor ? base : base.toLowerCase();
    } else if (naturalMinor || isMinorChord) {
      result = base.toLowerCase();
    }
  } else {
    const naturallyMajor = [3, 6, 7].includes(degree);
    result = naturallyMajor ? base : base.toLowerCase();
  }

  if (isDiminished) result += "°";
  if (isAugmented) result += "+";
  if (quality.includes("7")) result += "7";
  if (quality.includes("9")) result += "9";

  return lowerCase ? result.toLowerCase() : result;
}
