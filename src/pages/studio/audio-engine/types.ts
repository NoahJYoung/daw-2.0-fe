export enum AudioEngineState {
  playing = "PLAYING",
  recording = "RECORDING",
  paused = "PAUSED",
  stopped = "STOPPED",
}

export const inputOptions = ["mic", "midi"];

export const timeSignatureOptions = [
  { label: "2/4", value: "2" },
  { label: "3/4", value: "3" },
  { label: "4/4", value: "4" },
  { label: "5/4", value: "5" },
  { label: "6/4", value: "6" },
  { label: "7/4", value: "7" },
  { label: "5/8", value: "2.5" },
  { label: "7/8", value: "3.5" },
  { label: "9/8", value: "4.5" },
  { label: "11/8", value: "5.5" },
];

export const keys = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
  "Am",
  "Bbm",
  "Bm",
  "Cm",
  "C#m",
  "Dm",
  "Ebm",
  "Em",
  "Fm",
  "F#m",
  "Gm",
  "G#m",
];
