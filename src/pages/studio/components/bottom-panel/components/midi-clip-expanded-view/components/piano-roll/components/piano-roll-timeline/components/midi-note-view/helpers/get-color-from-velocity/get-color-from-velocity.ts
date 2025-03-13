export const getColorFromVelocity = (
  velocity: number,
  trackColor: [number, number, number]
): [number, number, number] => {
  velocity = Math.max(0, Math.min(127, velocity));

  const normalizedVelocity = velocity / 127;

  const grayColor: [number, number, number] = [175, 175, 175];

  const r = Math.round(
    grayColor[0] + (trackColor[0] - grayColor[0]) * normalizedVelocity
  );
  const g = Math.round(
    grayColor[1] + (trackColor[1] - grayColor[1]) * normalizedVelocity
  );
  const b = Math.round(
    grayColor[2] + (trackColor[2] - grayColor[2]) * normalizedVelocity
  );

  return [r, g, b];
};
