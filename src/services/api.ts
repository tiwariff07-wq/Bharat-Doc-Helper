export async function analyzeDocument(file: File, language: string): Promise<string> {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('language', language);

  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to analyze document');
  }

  const data = await response.json();
  return data.analysis;
}
