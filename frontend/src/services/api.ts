import type {
  EvidenceItem,
  SupportedFileType,
} from '../types';

/**
 * Empty initial evidence dataset.
 * Adheres to rule: "Use mock data only if necessary for the UI, but do not invent real evidence."
 */
export const INITIAL_EVIDENCE_LIST: EvidenceItem[] = [];

/**
 * Validates whether a given filename has a supported extension (CSV, XLSX, JSON, TXT).
 */
export function getFileTypeFromExtension(filename: string): SupportedFileType | null {
  const parts = filename.split('.');
  if (parts.length < 2) return null;
  const ext = parts.pop()?.toLowerCase();
  switch (ext) {
    case 'csv':
      return 'CSV';
    case 'xlsx':
      return 'XLSX';
    case 'json':
      return 'JSON';
    case 'txt':
      return 'TXT';
    default:
      return null;
  }
}

/**
 * Generates an explicitly labeled mock/demo hash value for mock/local data.
 * Adheres strictly to: "SHA-256 values shown in mock data are clearly mock/demo values
 * and are not presented as real calculated hashes."
 */
export function generateMockDemoSha256(seedText: string): string {
  let hash = 0;
  for (let i = 0; i < seedText.length; i++) {
    const char = seedText.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hexPart = Math.abs(hash).toString(16).padStart(8, '0');
  const randomSuffix = Math.random().toString(16).substring(2, 10);
  return `DEMO_MOCK_SHA256_${hexPart}${randomSuffix}`;
}

/**
 * Formats byte size into human-readable notation (e.g. "45.2 KB", "1.4 MB").
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Mock/local evidence upload service.
 * 
 * Complies with strict standalone requirements:
 * - Does NOT connect to the backend
 * - Pure local/mock execution
 * - Progresses gracefully through Ready -> Uploading -> Uploaded
 * - Produces clearly designated mock evidence item with DEMO_MOCK_SHA256 value
 */
export async function uploadEvidence(
  caseId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<EvidenceItem> {
  const normalizedCaseId = caseId.trim();
  if (!normalizedCaseId) {
    throw new Error('Case ID is required before uploading evidence.');
  }

  const supportedType = getFileTypeFromExtension(file.name);
  if (!supportedType) {
    throw new Error('Unsupported file type. Permitted formats: CSV, XLSX, JSON, TXT.');
  }

  // Simulate local progress steps: 25% -> 55% -> 85% -> 100%
  const progressSteps = [25, 55, 85, 100];
  for (const step of progressSteps) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    if (onProgress) {
      onProgress(step);
    }
  }

  const randomHex = Math.random().toString(16).substring(2, 10);

  const mockEvidence: EvidenceItem = {
    evidence_id: `mock_evd_${randomHex}`,
    case_id: normalizedCaseId,
    filename: file.name,
    file_type: supportedType,
    file_size: file.size,
    sha256: generateMockDemoSha256(file.name),
    uploaded_at: new Date().toISOString(),
    status: 'Uploaded (Mock)',
    is_mock: true,
  };

  return mockEvidence;
}
