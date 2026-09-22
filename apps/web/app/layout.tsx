import React from 'react';

export const metadata = {
  title: 'BilgenOS — Core Administration Workbench',
  description: 'The Education Operating System — Corporate Light Workbench',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#F7F8FA',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#20242A',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {children}
      </body>
    </html>
  );
}
