// Simple compression utility to reduce API response sizes
export function compressData(data: any): string {
  // Remove unnecessary whitespace and compress JSON
  return JSON.stringify(data, null, 0);
}

export function optimizeApiResponse(data: any) {
  // Remove null/undefined values to reduce size
  const cleaned = JSON.parse(JSON.stringify(data, (key, value) => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    return value;
  }));
  
  return cleaned;
}
