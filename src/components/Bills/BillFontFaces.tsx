import React, { useMemo } from 'react';

import { buildFontFaceCss } from '@/components/Bills/fonts';

/** Registers the receipt fonts (/public/fonts) so the preview matches the API output. */
const BillFontFaces: React.FC = () => {
  const css = useMemo(buildFontFaceCss, []);
  return <style>{css}</style>;
};

export default BillFontFaces;
