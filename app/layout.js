export const metadata = {
  title: 'Asan Crypto - AI Crypto Analyzer',
  description: 'Free AI-powered crypto research tool.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#030811" }}>
        {children}
      </body>
    </html>
  );
}
