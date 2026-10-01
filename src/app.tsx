import { StyleProvider, px2remTransformer } from '@ant-design/cssinjs';
import { ProConfigProvider } from '@ant-design/pro-components';
import React from 'react';

import ThemeProvider from '@/components/ThemeProvider';

// Convert AntD's px output to rem on the app's 10px root (matches Tailwind + global.less).
const px2rem = px2remTransformer({ rootValue: 10 });

// Zero PageContainer's gutters so pages align to .container-page.
// `pageContainer` is a valid pro token at runtime; the exported prop type omits it.
const proToken = {
  pageContainer: {
    paddingInlinePageContainerContent: 0,
    paddingBlockPageContainerContent: 0,
  },
} as React.ComponentProps<typeof ProConfigProvider>['token'];

export function rootContainer(container: React.ReactNode) {
  return (
    <StyleProvider transformers={[px2rem]}>
      <ThemeProvider>
        <ProConfigProvider token={proToken}>{container}</ProConfigProvider>
      </ThemeProvider>
    </StyleProvider>
  );
}
