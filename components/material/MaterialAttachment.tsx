'use client';

import React from 'react';
import { DownloadCloud, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

type MaterialAttachmentProps = {
  contentId?: string;
  fileName?: string;
  fileData: string;
  downloadName?: string;
};

export type StoredMaterial = {
  fileName: string;
  fileData: string;
  downloadName: string;
};

export function MaterialAttachment({ contentId, fileName, fileData, downloadName }: MaterialAttachmentProps) {
  const displayName = fileName || 'Documento adjunto';
  const finalDownloadName = downloadName || fileName || 'material';

  const openPreview = () => {
    if (contentId) {
      window.open(`/material-viewer?contentId=${encodeURIComponent(contentId)}`, '_blank');
      return;
    }

    const id = `material-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const material: StoredMaterial = {
      fileName: displayName,
      fileData,
      downloadName: finalDownloadName,
    };

    try {
      sessionStorage.setItem(id, JSON.stringify(material));
      window.open(`/material-viewer?id=${encodeURIComponent(id)}`, '_blank');
    } catch (error) {
      window.open(fileData, '_blank');
    }
  };

  return (
    <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-gray-100">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
          <FileText className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate pr-4">{displayName}</p>
          <p className="text-xs text-gray-500">Documento adjunto</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 whitespace-nowrap" onClick={openPreview}>
          <Eye className="h-4 w-4 mr-2" />
          Ver archivo
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap" asChild>
          <a href={fileData} download={finalDownloadName}>
            <DownloadCloud className="h-4 w-4 mr-2" />
            Descargar material
          </a>
        </Button>
      </div>
    </div>
  );
}
