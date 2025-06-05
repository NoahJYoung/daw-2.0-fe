export function prepareChordSymbol(chordSymbol: string) {
  let newChordSymbol = chordSymbol;
  const annotationsToRemove = ["no5", "M"];
  annotationsToRemove.forEach((annotation) => {
    newChordSymbol = newChordSymbol?.replace(annotation, "");
  });
  return newChordSymbol;
}
