export async function uploadFile(file: File): Promise<string> {
  return URL.createObjectURL(file);
}
