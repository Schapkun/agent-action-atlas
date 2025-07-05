
import { useState, useCallback } from 'react';

export const useInvoicePreview = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(0.8);

  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  const handleZoomIn = useCallback(() => {
    setPreviewZoom(prev => Math.min(1.2, prev + 0.1));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPreviewZoom(prev => Math.max(0.4, prev - 0.1));
  }, []);

  const resetZoom = useCallback(() => {
    setPreviewZoom(0.8);
  }, []);

  return {
    showPreview,
    setShowPreview,
    togglePreview,
    previewZoom,
    setPreviewZoom,
    handleZoomIn,
    handleZoomOut,
    resetZoom
  };
};
