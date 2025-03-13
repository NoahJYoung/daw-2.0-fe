export interface LineData {
  value: number;
  displayValue: string;
}

export interface Point {
  frequency: number;
  gain: number;
  type: "marker" | "baseline" | "highpass" | "highshelf" | "peaking" | "curve";
}

export const xLines: LineData[] = [
  {
    value: 20,
    displayValue: "20",
  },
  {
    value: 50,
    displayValue: "50",
  },
  {
    value: 100,
    displayValue: "100",
  },
  {
    value: 200,
    displayValue: "200",
  },
  {
    value: 300,
    displayValue: "300",
  },
  {
    value: 500,
    displayValue: "500",
  },
  {
    value: 1000,
    displayValue: "1k",
  },
  {
    value: 2000,
    displayValue: "2k",
  },
  {
    value: 3000,
    displayValue: "3k",
  },
  {
    value: 5000,
    displayValue: "5k",
  },
  {
    value: 10000,
    displayValue: "10k",
  },
  {
    value: 20000,
    displayValue: "20k",
  },
];

export const yLines: LineData[] = [
  {
    value: -6,
    displayValue: "-6",
  },
  {
    value: 0,
    displayValue: "+0",
  },
  {
    value: 6,
    displayValue: "+6",
  },
];
