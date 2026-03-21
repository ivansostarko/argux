import { useState, useRef } from 'react';
import { theme } from '../../lib/theme';
import { useToast } from '../ui/Toast';

interface Props {
    photos: string[];
    onPhotosChange?: (photos: string[]) => void;
    editable?: boolean;
}

export default function VehiclePhotos({ photos, onPhotosChange, editable = false }: Props) {
    const toast = useToast();
    const [lightbox, setLightbox] = useState<number | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !onPhotosChange) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                onPhotosChange([...photos, reader.result as string]);
                toast.success('Photo uploaded', file.name);
            };
            reader.readAsDataURL(file);
        });
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleDelete = (index: number) => {
        if (!onPhotosChange) return;
        onPhotosChange(photos.filter((_, i) => i !== index));
        toast.warning('Photo removed');
    };

    return (
        <>
            {/* Lightbox */}
            {lightbox !== null && (
                <div className="veh-lightbox" onClick={() => setLightbox(null)}>
                    <button className="veh-lightbox-close" onClick={() => setLightbox(null)}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>
                    </button>
                    {photos.length > 1 && <>
                        <button className="veh-lightbox-nav prev" onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + photos.length) % photos.length); }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 3L5 8l5 5"/></svg>
                        </button>
                        <button className="veh-lightbox-nav next" onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % photos.length); }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 3l5 5-5 5"/></svg>
                        </button>
                    </>}
                    <img src={photos[lightbox]} alt="" onClick={e => e.stopPropagation()} />
                    <div className="veh-lightbox-counter">{lightbox + 1} / {photos.length}</div>
                </div>
            )}

            {/* Gallery grid */}
            {photos.length > 0 && (
                <div className="veh-photos-grid">
                    {photos.map((photo, i) => (
                        <div key={i} className="veh-photo-card">
                            <img src={photo} alt={`Vehicle photo ${i + 1}`} onClick={() => setLightbox(i)} />
                            <div className="veh-photo-overlay">
                                <button className="veh-photo-action view" onClick={() => setLightbox(i)} title="View full size">
                                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>
                                </button>
                                {editable && (
                                    <button className="veh-photo-action delete" onClick={() => handleDelete(i)} title="Delete photo">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload zone */}
            {editable && (
                <div className="veh-upload-zone" onClick={() => fileRef.current?.click()} style={{ marginTop: photos.length > 0 ? 10 : 0 }}>
                    <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <div style={{ fontSize: 13, fontWeight: 600, color: theme.accent }}>Upload Photos</div>
                    <div style={{ fontSize: 11, color: theme.textDim }}>Click or drag · JPG, PNG · Max 10MB</div>
                </div>
            )}

            {/* Empty state for non-editable */}
            {!editable && photos.length === 0 && (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: theme.textDim, fontSize: 13, border: `1px dashed ${theme.border}`, borderRadius: 8 }}>No photos available.</div>
            )}
        </>
    );
}
