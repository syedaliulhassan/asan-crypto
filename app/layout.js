export const metadata = {
  title: 'Asan Crypto - AI Crypto Analyzer',
  description: 'Free AI-powered crypto research tool. Fundamentals, tokenomics, halal status and more.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
