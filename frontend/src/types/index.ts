export type SupportedFileType = 'CSV' | 'XLSX' | 'JSON' | 'TXT';

export type UploadStatus = 'Ready' | 'Uploading' | 'Uploaded' | 'Error';

export interface EvidenceUploadResponse {
  evidence_id: string;
  case_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  sha256: string;
  uploaded_at: string;
  status: string;
}

export interface EvidenceItem {
  evidence_id: string;
  case_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  sha256: string;
  uploaded_at: string;
  status: string;
  is_mock?: boolean;
}

export interface SelectedFileInfo {
  file: File;
  name: string;
  size: number;
  extension: string;
  normalizedType: SupportedFileType | null;
  isValid: boolean;
  validationError?: string;
}
