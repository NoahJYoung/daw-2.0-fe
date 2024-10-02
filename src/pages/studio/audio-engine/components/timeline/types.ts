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

export const SubdivisionSelectOptions = [
  {
    label: "1/1",
    value: "1n",
  },
  {
    label: "1/2",
    value: "2n",
  },
  {
    label: "1/2T",
    value: "2t",
  },
  {
    label: "1/4",
    value: "4n",
  },
  {
    label: "1/4T",
    value: "4t",
  },
  {
    label: "1/8",
    value: "8n",
  },
  {
    label: "1/8T",
    value: "8t",
  },
  {
    label: "1/16",
    value: "16n",
  },
  {
    label: "1/16T",
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
