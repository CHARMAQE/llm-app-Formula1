// app/layout.tsx
import './global.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'My LLM App',
  description: 'A Next.js project with LLM',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
