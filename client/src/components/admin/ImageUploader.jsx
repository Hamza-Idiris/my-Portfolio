import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, Upload, FileText } from 'lucide-react';
import { useUpload } from '../../hooks/useAdminResource.js';
import { AdminButton, AdminField, inputClasses } from './AdminPrimitives.jsx';

/**
 * Uploads media or PDF documents through the API storage adapter
 */
export function MediaUploader({
  label,
  hint,
  value,
  alt,
  onChange,
  onAltChange,
  folder = 'general',
  accept = 'image/*,application/pdf',
  allowPdf = true,
}) {
  const inputRef = useRef(null);
  const upload = useUpload();
  const [error, setError] = useState(null);

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    upload.mutate(
      { file, folder },
      {
        onSuccess: (result) => onChange(result.url, result.storageId),
        onError: (uploadError) => setError(uploadError.message),
      },
    );
    event.target.value = '';
  };

  const isPdf = typeof value === 'string' && (value.endsWith('.pdf') || value.includes('/raw/upload/') || value.includes('format=pdf'));

  return (
    <AdminField label={label} hint={hint} error={error}>
      <div className="space-y-3">
        {value ? (
          <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900 p-2">
            {isPdf ? (
              <div className="flex items-center gap-3 p-4 bg-slate-950/60 rounded-lg">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-200 truncate">PDF Document Uploaded</p>
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal-400 hover:underline inline-block mt-0.5"
                  >
                    View Document ↗
                  </a>
                </div>
              </div>
            ) : (
              <img src={value} alt={alt || ''} className="max-h-60 w-full object-contain rounded-lg bg-slate-950/40" />
            )}

            <button
              type="button"
              onClick={() => onChange('', '')}
              aria-label="Remove asset"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950/80 text-slate-300 transition-colors hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-700 bg-slate-900/50 px-4 py-8 text-slate-500 transition-colors hover:border-slate-600 hover:text-slate-300"
          >
            {upload.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            )}
            <span className="text-sm">{upload.isPending ? 'Uploading...' : 'Upload Image or PDF'}</span>
            <span className="text-xs text-slate-600">
              {allowPdf ? 'JPG, PNG, WebP, SVG or PDF documents' : 'JPG, PNG, WebP or SVG'}
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFile}
          className="sr-only"
          aria-label={`Upload ${label}`}
        />

        <div className="flex gap-2">
          <input
            type="text"
            value={value || ''}
            onChange={(event) => onChange(event.target.value, '')}
            placeholder="Or paste URL (Image or PDF)"
            className={inputClasses}
            aria-label="Media or PDF URL"
          />
          {value ? null : (
            <AdminButton onClick={() => inputRef.current?.click()} loading={upload.isPending}>
              <Upload className="h-4 w-4" />
            </AdminButton>
          )}
        </div>

        {onAltChange ? (
          <input
            type="text"
            value={alt || ''}
            onChange={(event) => onAltChange(event.target.value)}
            placeholder="Alt text, describing the image for screen readers"
            className={inputClasses}
            aria-label="Image alt text"
          />
        ) : null}
      </div>
    </AdminField>
  );
}

export { MediaUploader as ImageUploader };
