export const reverbBufferKeys = [
  "reverbs/fat_plate.wav",
  "reverbs/jazz_hall.wav",
];

export const reverbSelectItems = reverbBufferKeys.map((value) => ({
  label: value.split("/")[1].split(".")[0].replace("_", " "),
  value,
}));
