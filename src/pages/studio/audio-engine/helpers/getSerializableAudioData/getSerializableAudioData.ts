export const getSerializableAudioData = (
  data: Float32Array | Float32Array[]
) => {
  if (Array.isArray(data)) {
    return data.map((channel) => Array.from(channel));
  }

  return Array.from(data);
};
