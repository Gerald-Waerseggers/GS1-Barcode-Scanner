export async function loadMappingFile(
  filename: string,
): Promise<string | null> {
  try {
    const root = await navigator.storage.getDirectory();
    try {
      const fileHandle = await root.getFileHandle(filename);
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (e) {
      // File doesn't exist yet, which is fine for first run
      return null;
    }
  } catch (error) {
    console.warn("Failed to access OPFS:", error);
    return null;
  }
}

export async function saveMappingFile(
  filename: string,
  content: string,
): Promise<void> {
  try {
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  } catch (error) {
    console.error("Failed to save file to OPFS:", error);
  }
}
