import { makeAutoObservable } from "mobx";
import { AudioClip } from "../audio-clip";
import { MidiClip } from "../midi-clip";
import { Track } from "../track";
import { Clip } from "../types";
import { MidiNote } from "../midi-note";

type ClipboardItem = Clip | Track | MidiNote;

export class Clipboard {
  private clips: Clip[] = [];
  private tracks: Track[] = [];
  private notes: MidiNote[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  copy(items: ClipboardItem[]) {
    const trackItems = [...items].filter((item) => item instanceof Track);
    const clipItems = [...items].filter(
      (item) => item instanceof AudioClip || item instanceof MidiClip
    );
    const noteItems = [...items.filter((item) => item instanceof MidiNote)];

    this.tracks = trackItems;
    this.clips = clipItems;
    this.notes = noteItems;
  }

  getClips() {
    return this.clips;
  }

  getTracks() {
    return this.tracks;
  }

  getNotes() {
    return this.notes;
  }

  getAll() {
    return { clips: this.clips, tracks: this.tracks };
  }
}
