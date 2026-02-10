import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
    value, 
    onChange, 
    placeholder = "Glissez une image ici ou cliquez pour upload",
    className = ""
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert("Veuillez uploader une image valide.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            onChange(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    return (
        <div className={`w-full ${className}`}>
            {value ? (
                <div className="relative group border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-50 h-32 flex items-center justify-center">
                    <img 
                        src={value} 
                        alt="Preview" 
                        className="max-h-full max-w-full object-contain" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                            onClick={() => onChange('')}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-transform hover:scale-110"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <label 
                    className={`
                        flex flex-col items-center justify-center w-full h-32 
                        border-2 border-dashed rounded-lg cursor-pointer 
                        transition-colors duration-200
                        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'}
                    `}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                        <Upload className={`w-8 h-8 mb-3 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                        <p className="mb-2 text-xs font-semibold text-center px-4">
                            {placeholder}
                        </p>
                        <p className="text-[10px] text-slate-400">SVG, PNG, JPG (Max 2MB)</p>
                    </div>
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                </label>
            )}
        </div>
    );
};
