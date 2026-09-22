import React, { useState, useRef } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import type {
  UploadStatus,
  SelectedFileInfo,
  EvidenceItem,
} from '../../types';
import {
  getFileTypeFromExtension,
  formatBytes,
  uploadEvidence,
} from '../../services/api';
import './EvidenceUpload.css';

interface EvidenceUploadProps {
  caseId: string;
  onCaseIdChange: (newCaseId: string) => void;
  onEvidenceUploaded: (newEvidence: EvidenceItem) => void;
}

export const EvidenceUpload: React.FC<EvidenceUploadProps> = ({
  caseId,
  onCaseIdChange,
  onEvidenceUploaded,
}) => {
  const [selectedFile, setSelectedFile] = useState<SelectedFileInfo | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('Ready');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [lastUploadedEvidence, setLastUploadedEvidence] = useState<EvidenceItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    const filename = file.name;
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const normalizedType = getFileTypeFromExtension(filename);

    if (!normalizedType) {
      setValidationError(
        `Unsupported file type (.${extension || 'unknown'}). Only CSV, XLSX, JSON, and TXT files are permitted for evidence ingestion.`
      );
      setSelectedFile(null);
      setUploadStatus('Error');
      return;
    }

    setValidationError(null);
    setSelectedFile({
      file,
      name: filename,
      size: file.size,
      extension: extension.toUpperCase(),
      normalizedType,
      isValid: true,
    });
    setUploadStatus('Ready');
    setUploadProgress(0);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setValidationError(null);
    setUploadStatus('Ready');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedFile.isValid) {
      return;
    }

    const trimmedCaseId = caseId.trim();
    if (!trimmedCaseId) {
      setValidationError('Please specify a Case Identifier before uploading evidence.');
      setUploadStatus('Error');
      return;
    }

    try {
      setUploadStatus('Uploading');
      setUploadProgress(10);
      setValidationError(null);

      const result = await uploadEvidence(
        trimmedCaseId,
        selectedFile.file,
        (percent) => setUploadProgress(percent)
      );

      onEvidenceUploaded(result);
      setLastUploadedEvidence(result);
      setUploadStatus('Uploaded');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred during evidence upload.';
      setValidationError(message);
      setUploadStatus('Error');
    }
  };

  return (
    <div className="upload-card">
      <div className="upload-card-header">
        <h2 className="upload-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Evidence Ingestion
        </h2>
        <p className="upload-section-subtitle">
          Securely submit digital artifact files for hashing and cross-evidence analysis.
        </p>
      </div>

      {/* 1. Case ID input */}
      <div className="case-id-group">
        <label htmlFor="case-id-input" className="field-label">
          <span>Case Identifier</span>
          <span className="field-hint">Chain of Custody ID</span>
        </label>
        <div className="case-input-wrapper">
          <span className="case-input-icon" aria-hidden="true">#</span>
          <input
            id="case-id-input"
            type="text"
            className="case-input"
            placeholder="e.g. CASE_2026_001"
            value={caseId}
            onChange={(e) => {
              onCaseIdChange(e.target.value);
              if (validationError && e.target.value.trim()) {
                setValidationError(null);
              }
            }}
            disabled={uploadStatus === 'Uploading'}
          />
        </div>
      </div>

      {/* 2. Drag-and-drop upload area & 3. File picker */}
      <div
        className={`dropzone ${isDragOver ? 'is-dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Drag and drop digital artifact here or browse files"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.json,.txt"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="evidence-file-input"
        />

        <div className="dropzone-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 16 12 12 8 16"></polyline>
            <line x1="12" y1="12" x2="12" y2="21"></line>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
            <polyline points="16 16 12 12 8 16"></polyline>
          </svg>
        </div>

        <div>
          <span className="dropzone-text-primary">Drag & drop digital artifact here</span>
          <span className="dropzone-text-secondary"> or </span>
          <button
            type="button"
            className="browse-btn"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse Files
          </button>
        </div>

        {/* 4. Supported Formats Badge List */}
        <div className="supported-formats-wrapper">
          <span className="supported-label">Supported Formats:</span>
          <span className="format-badge csv">CSV</span>
          <span className="format-badge xlsx">XLSX</span>
          <span className="format-badge json">JSON</span>
          <span className="format-badge txt">TXT</span>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="validation-alert" role="alert">
          <span className="alert-icon" aria-hidden="true">⚠️</span>
          <div>
            <strong>Validation Error:</strong> {validationError}
          </div>
        </div>
      )}

      {/* Selected File Details */}
      {selectedFile && (
        <div className="selected-file-panel">
          <div className="selected-file-main">
            <div className="selected-file-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <div className="selected-file-meta">
              <span className="selected-file-name" title={selectedFile.name}>
                {selectedFile.name}
              </span>
              <div className="selected-file-details">
                <span className="file-type-pill">{selectedFile.normalizedType}</span>
                <span>•</span>
                <span>{formatBytes(selectedFile.size)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="clear-file-btn"
            onClick={handleClearSelection}
            title="Remove selected file"
            disabled={uploadStatus === 'Uploading'}
            aria-label="Remove selected file"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      {/* 6. Upload Status / Progress */}
      {uploadStatus === 'Uploading' && (
        <div className="progress-bar-container">
          <div className="progress-label">
            <span>Ingesting artifact & generating demo hash...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="progress-track" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      {/* Success Notification after upload */}
      {uploadStatus === 'Uploaded' && lastUploadedEvidence && (
        <div className="upload-success-notice">
          <div className="success-icon" aria-hidden="true">✓</div>
          <div className="success-details">
            <span className="success-title">Successfully Ingested (Mock Ingestion)</span>
            <span className="success-file">{lastUploadedEvidence.filename}</span>
            <span className="success-hash">Mock Hash: {lastUploadedEvidence.sha256}</span>
          </div>
        </div>
      )}

      {/* 5. Upload Button & Status Row */}
      <div className="action-status-wrapper">
        <button
          type="button"
          className="upload-button"
          onClick={handleUpload}
          disabled={!selectedFile || !selectedFile.isValid || !caseId.trim() || uploadStatus === 'Uploading'}
        >
          {uploadStatus === 'Uploading' ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin" aria-hidden="true">
                <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"></circle>
              </svg>
              Uploading Evidence Artifact...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Upload Evidence Artifact
            </>
          )}
        </button>

        <div className="status-pill-row">
          <span className="status-label-heading">Ingestion Status</span>
          <div className={`status-pill ${uploadStatus.toLowerCase()}`}>
            <span className="status-dot"></span>
            <span>{uploadStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
