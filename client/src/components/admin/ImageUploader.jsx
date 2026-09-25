import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import { useUpload } from '../../hooks/useAdminResource.js';
import { AdminButton, AdminField, inputClasses } from './AdminPrimitives.jsx';

/**
 * Uploads through the API's storage adapter (Cloudinary or local disk) and
 * also accepts a pasted URL, so images hosted elsewhere still work.
 */
export function ImageUploader({ label, hint, value, alt, onChange, onAltChange, folder = 'general' }) {
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

  return (
    <AdminField label={label} hint={hint} error={error}>
      <div className="space-y-3">
        {value ? (
          <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
            <img src={value} alt={alt || ''} className="max-h-56 w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('', '')}
              aria-label="Remove image"
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950/80 text-slate-300 transition-colors hover:text-red-400"
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
            <span className="text-sm">{upload.isPending ? 'Uploading' : 'Upload an image'}</span>
            <span className="text-xs text-slate-600">JPG, PNG, WebP or SVG</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="sr-only"
          aria-label={`Upload ${label}`}
        />

        <div className="flex gap-2">
          <input
            type="text"
            value={value || ''}
            onChange={(event) => onChange(event.target.value, '')}
            placeholder="Or paste an image URL"
            className={inputClasses}
            aria-label="Image URL"
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
