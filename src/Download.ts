
export function downloadBlob(blob: Blob, fileName: string) {
  let fileURL = window.URL.createObjectURL(blob);

  let link = document.createElement("a");
  link.href = fileURL;
  link.download = fileName;
  link.click();

  setTimeout(() => {
    window.URL.revokeObjectURL(fileURL);
  }, 250); // firefox requires timeout
}