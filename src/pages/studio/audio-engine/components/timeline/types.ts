export enum GridSubdivision {
  WHOLE_NOTE = "1n",
  HALF_NOTE = "2n",
  HALF_NOTE_TRIPLET = "2t",
  QUARTER_NOTE = "4n",
  QUARTER_NOTE_TRIPLET = "4t",
  EIGHTH_NOTE = "8n",
  EIGHTH_NOTE_TRIPLET = "8t",
  SIXTEENTH_NOTE = "16n",
  SIXTEENTH_NOTE_TRIPLET = "16t",
}

export type NoteValue =
  | "1n"
  | "2n"
  | "2t"
  | "4n"
  | "4t"
  | "8n"
  | "8t"
  | "16n"
  | "16t";

export const SubdivisionSelectOptions: { label: string; value: NoteValue }[] = [
  {
    label: "Whole Note",
    value: "1n",
  },
  {
    label: "Half Note",
    value: "2n",
  },
  {
    label: "Triplet Half",
    value: "2t",
  },
  {
    label: "Quarter Note",
    value: "4n",
  },
  {
    label: "Triplet Quarter",
    value: "4t",
  },
  {
    label: "Eighth Note",
    value: "8n",
  },
  {
    label: "Triplet Eighth",
    value: "8t",
  },
  {
    label: "Sixteenth Note",
    value: "16n",
  },
  {
    label: "Triplet Sixteenth",
    value: "16t",
  },
  // {
  //   label: "1/32",
  //   value: "32n",
  // },
  // {
  //   label: "1/32T",
  //   value: "32t",
  // },
];
