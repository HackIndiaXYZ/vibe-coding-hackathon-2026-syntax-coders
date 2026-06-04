import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LifeLink',
  description: 'AI when it\'s enough. Real doctors when it\'s urgent.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}