export function isNDEFReaderSupported(): boolean {
  const supported = 'NDEFReader' in window;
  if (!supported) {
    console.warn('NDEFReader is not supported in this browser');
  }
  return supported;
}
