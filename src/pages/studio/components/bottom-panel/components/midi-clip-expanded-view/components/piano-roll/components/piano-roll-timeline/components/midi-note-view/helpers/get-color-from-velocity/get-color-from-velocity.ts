export const getColorFromVelocity = (
  velocity: number
): [number, number, number] => {
  velocity = Math.max(0, Math.min(128, velocity));

  const normalizedVelocity = velocity / 128;

  if (normalizedVelocity < 0.5) {
    const grayToYellow = normalizedVelocity * 2;
    const r = Math.round(255 * grayToYellow);
    const g = Math.round(255 * grayToYellow);
    const b = Math.round(200 * (1 - grayToYellow));
    return [r, g, b];
  } else {
    const yellowToRed = (normalizedVelocity - 0.5) * 2;
    const r = 255;
    const g = Math.round(255 * (1 - yellowToRed));
    const b = 0;
    return [r, g, b];
  }
};
