export function blobToJsonObject(blob: Blob): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const jsonObject = JSON.parse(reader.result as string);
        resolve(jsonObject);
      } catch (error) {
        console.error(error);
        reject(new Error("Failed to parse JSON"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.readAsText(blob);
  });
}
