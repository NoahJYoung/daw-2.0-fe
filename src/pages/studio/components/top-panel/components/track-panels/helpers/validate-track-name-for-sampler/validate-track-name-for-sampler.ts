export const validateTrackNameForSampler = (trackName: string) => {
  const noteRegex = /^([a-g])([#b])?([1-8])$/i;

  return noteRegex.test(trackName);
};
