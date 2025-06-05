import PitchFinder from "pitchfinder";
import * as Tone from "tone";

export interface MidiNote {
  note: number;
  startTime: number;
  durationInNotation?: string;
  endTime: number;
  endTimeInNotation?: string;
  duration: number;
  velocity: number;
  frequency: number;
}

export const getMidiNotesFromAudioBuffer = async (
  audioBuffer: Tone.ToneAudioBuffer,
  options: {
    tempo?: number;
    quantization?: number;
    minNoteDuration?: number;
    pitchThreshold?: number;
    velocityThreshold?: number;
    noteTolerance?: number; // Semitones tolerance for note continuation
    silenceThreshold?: number; // Minimum silence duration to end a note
    transientSmoothingWindow?: number; // Samples to smooth over for transient detection
  } = {}
): Promise<MidiNote[]> => {
  const {
    tempo = 130,
    quantization = 4,
    minNoteDuration = 0.1,
    pitchThreshold = 0.9,
    velocityThreshold = 0.001,
    noteTolerance = 0.5, // Half semitone tolerance
    silenceThreshold = 0.05, // 50ms of silence to end note
    transientSmoothingWindow = 3,
  } = options;

  const float32Array = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;

  const detectPitch = PitchFinder.YIN({
    threshold: pitchThreshold,
    sampleRate,
  });

  const detectors = [
    detectPitch,
    PitchFinder.AMDF({ sampleRate }),
    PitchFinder.DynamicWavelet({ sampleRate }),
  ];

  const rawFrequencies = PitchFinder.frequencies(detectors, float32Array, {
    tempo,
    quantization,
  });

  const smoothedFrequencies = smoothFrequencies(
    rawFrequencies,
    transientSmoothingWindow
  );

  const amplitudes = calculateAmplitudes(float32Array, rawFrequencies.length);

  const beatsPerSecond = tempo / 60;
  const samplesPerBeat = quantization;
  const timePerSample = 1 / (beatsPerSecond * samplesPerBeat);

  const midiNotes: MidiNote[] = [];
  let currentNote: Partial<MidiNote> | null = null;
  let silenceCounter = 0;
  const silenceSamples = Math.ceil(silenceThreshold / timePerSample);

  smoothedFrequencies.forEach((frequency, index) => {
    const currentTime = index * timePerSample;
    const amplitude = amplitudes[index];
    const velocity = Math.min(127, Math.max(1, Math.floor(amplitude * 127)));

    const hasValidPitch = frequency && frequency > 0;
    const hasValidAmplitude = amplitude > velocityThreshold;

    if (hasValidPitch && hasValidAmplitude) {
      const midiNoteNumber = frequencyToMidi(frequency);

      if (currentNote) {
        // Check if this is a continuation of the current note
        const noteDifference = Math.abs(midiNoteNumber - currentNote.note!);
        const isNoteContinuation = noteDifference <= noteTolerance;

        if (isNoteContinuation) {
          // Continue current note - update velocity if this sample is louder
          if (velocity > currentNote.velocity!) {
            currentNote.velocity = velocity;
          }
          silenceCounter = 0; // Reset silence counter
        } else {
          // Different note detected - end current note and start new one
          finishNote(currentNote, currentTime, midiNotes, minNoteDuration);
          currentNote = startNewNote(
            midiNoteNumber,
            currentTime,
            frequency,
            velocity
          );
          silenceCounter = 0;
        }
      } else {
        // Start new note
        currentNote = startNewNote(
          midiNoteNumber,
          currentTime,
          frequency,
          velocity
        );
        silenceCounter = 0;
      }
    } else {
      // No valid pitch or amplitude
      if (currentNote) {
        silenceCounter++;

        // Only end the note if we've had enough consecutive silence
        if (silenceCounter >= silenceSamples) {
          finishNote(
            currentNote,
            currentTime - silenceCounter * timePerSample,
            midiNotes,
            minNoteDuration
          );
          currentNote = null;
          silenceCounter = 0;
        }
      }
    }
  });

  if (currentNote) {
    const totalDuration = smoothedFrequencies.length * timePerSample;
    finishNote(currentNote, totalDuration, midiNotes, minNoteDuration);
  }

  return midiNotes;
};

const smoothFrequencies = (
  frequencies: (number | null)[],
  windowSize: number
): (number | null)[] => {
  const smoothed = [...frequencies];

  for (let i = 0; i < frequencies.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(
      frequencies.length,
      i + Math.floor(windowSize / 2) + 1
    );

    // Collect valid frequencies in the window
    const validFreqs: number[] = [];
    for (let j = start; j < end; j++) {
      if (frequencies[j] && frequencies[j]! > 0) {
        validFreqs.push(frequencies[j]!);
      }
    }

    if (validFreqs.length > 0) {
      // Use median frequency to avoid outliers
      validFreqs.sort((a, b) => a - b);
      const medianIndex = Math.floor(validFreqs.length / 2);
      smoothed[i] = validFreqs[medianIndex];
    }
  }

  return smoothed;
};

// Calculate amplitudes corresponding to frequency detection points
const calculateAmplitudes = (
  audioData: Float32Array,
  numPoints: number
): number[] => {
  const amplitudes: number[] = [];
  const chunkSize = Math.floor(audioData.length / numPoints);

  for (let i = 0; i < numPoints; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, audioData.length);

    // Calculate RMS amplitude for this chunk
    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j++) {
      sum += audioData[j] * audioData[j];
      count++;
    }

    const rms = count > 0 ? Math.sqrt(sum / count) : 0;
    amplitudes.push(rms);
  }

  return amplitudes;
};

// Helper function to start a new note
const startNewNote = (
  midiNoteNumber: number,
  startTime: number,
  frequency: number,
  velocity: number
): Partial<MidiNote> => {
  return {
    note: midiNoteNumber,
    startTime,
    frequency,
    velocity,
  };
};

// Helper function to convert frequency to MIDI note number
const frequencyToMidi = (frequency: number): number => {
  if (frequency <= 0) return 0;
  const midiNote = 12 * Math.log2(frequency / 440) + 69;
  return Math.max(0, Math.min(127, Math.round(midiNote)));
};

// Helper function to finish a note and add it to the collection
const finishNote = (
  note: Partial<MidiNote>,
  endTime: number,
  midiNotes: MidiNote[],
  minNoteDuration: number
) => {
  if (
    !note.note ||
    note.startTime === undefined ||
    !note.frequency ||
    !note.velocity
  )
    return;

  const duration = endTime - note.startTime!;

  // Only add notes that meet minimum duration requirement
  if (duration >= minNoteDuration) {
    midiNotes.push({
      note: note.note,
      startTime: note.startTime!,
      durationInNotation: Tone.Time(
        Tone.Time(duration).quantize("16n")
      ).toNotation(),
      endTime,
      endTimeInNotation: Tone.Time(
        Tone.Time(endTime).quantize("16n")
      ).toNotation(),
      duration,
      velocity: note.velocity,
      frequency: note.frequency,
    });
  }
};

// Utility function to convert MIDI note number to note name
export const midiToNoteName = (midiNote: number): string => {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const octave = Math.floor(midiNote / 12) - 1;
  const noteName = noteNames[midiNote % 12];
  return `${noteName}${octave}`;
};

// Utility function to export MIDI notes to a simple MIDI-like format
export const exportToMidiData = (midiNotes: MidiNote[]) => {
  return midiNotes.map((note) => ({
    type: "note",
    note: note.note,
    noteName: midiToNoteName(note.note),
    time: note.startTime,
    duration: note.duration,
    velocity: note.velocity,
  }));
};
