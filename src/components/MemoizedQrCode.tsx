import React, { memo, useMemo } from 'react';

interface MemoizedQrCodeProps {
  tokenId?: string;
  qrDataUrl?: string;
  fallbackData?: string;
  className?: string;
}

// Session cache to guarantee zero redundant re-generations or layout shifts across component lifecycle
const qrSessionCache = new Map<string, string>();

export const MemoizedQrCode: React.FC<MemoizedQrCodeProps> = memo(({
  tokenId,
  qrDataUrl,
  fallbackData = 'DA-STUDENT',
  className = 'w-full h-full object-contain block select-none',
}) => {
  const finalQrSrc = useMemo(() => {
    if (qrDataUrl) return qrDataUrl;
    if (tokenId && qrSessionCache.has(tokenId)) {
      return qrSessionCache.get(tokenId)!;
    }
    const computed = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tokenId || fallbackData)}`;
    if (tokenId) {
      qrSessionCache.set(tokenId, computed);
    }
    return computed;
  }, [tokenId, qrDataUrl, fallbackData]);

  return (
    <img
      src={finalQrSrc}
      alt="Student Permanent QR Code"
      className={className}
      loading="eager"
      decoding="sync"
    />
  );
}, (prevProps, nextProps) => {
  return prevProps.tokenId === nextProps.tokenId && prevProps.qrDataUrl === nextProps.qrDataUrl;
});
