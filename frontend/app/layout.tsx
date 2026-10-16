import type {Metadata, Viewport} from 'next';
import {Inter, Poppins} from 'next/font/google';
import './globals.css';
import {cn} from '@/lib/utils';
import ReactQueryProvider from '@/lib/provider/ReactQueryProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://yourdomain.vercel.app'), // Replace with your actual URL
  title: 'UCJM Praise & Worship',
  description:
    'Unity in Christ Jesus Ministries — who is serving, which songs are planned, and when the next service is.',
  icons: {
    icon: [
      {url: '/assets/logo.png', type: 'image/png', sizes: '32x32'},
      {url: '/assets/logo.png', type: 'image/png', sizes: '192x192'}
    ],
    apple: '/assets/logo.png'
  },
  openGraph: {
    title: 'UCJM Praise & Worship',
    description:
      'Unity in Christ Jesus Ministries — who is serving, which songs are planned, and when the next service is.',
    url: 'https://yourdomain.vercel.app/',
    type: 'website',
    images: [
      {
        url: '/assets/logo.png', // Replace with your actual image path of logo
        width: 1200,
        height: 630,
        alt: 'UCJM Praise & Worship'
      }
    ]
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Lets the app use the full screen on phones with a notch (DESIGN.md section 9)
  viewportFit: 'cover',
  themeColor: '#0b3d91'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn('h-full', inter.variable, poppins.variable)}
    >
      <body className="flex min-h-dvh flex-col">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
