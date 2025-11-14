import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hải sản Ngày mới Cô Tô",
  description: "Hải sản tươi sống, đông lạnh và chế biến sẵn từ Cô Tô. Cam kết chất lượng, giao hàng nhanh tại khu vực Đông Bắc Bộ.",
  keywords: [
    "hải sản",
    "Cô Tô",
    "hải sản tươi sống",
    "hải sản đông lạnh",
    "chả mực",
    "sashimi",
    "tôm",
    "cua",
    "ghẹ",
    "hải sản tươi ngon",
    "đông lạnh",
    "chế biến sẵn"
  ],
  authors: [{ name: "Hải sản Ngày mới Cô Tô" }],
  creator: "Hải sản Ngày mới Cô Tô",
  publisher: "Hải sản Ngày mới Cô Tô",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://haisanngaymoi.vn'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Hải sản Ngày mới Cô Tô - Hải sản tươi ngon từ biển Cô Tô",
    description: "Hải sản tươi sống, đông lạnh và chế biến sẵn từ Cô Tô. Cam kết chất lượng, giao hàng nhanh tại khu vực Đông Bắc Bộ.",
    url: 'https://haisanngaymoi.vn',
    siteName: 'Hải sản Ngày mới Cô Tô',
    images: [
      {
        url: '/wallpaper.png',
        width: 1200,
        height: 630,
        alt: 'Hải sản Ngày mới Cô Tô - Hải sản tươi ngon từ biển Cô Tô',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Hải sản Ngày mới Cô Tô - Hải sản tươi ngon từ biển Cô Tô",
    description: "Hải sản tươi sống, đông lạnh và chế biến sẵn từ Cô Tô. Cam kết chất lượng, giao hàng nhanh tại khu vực Đông Bắc Bộ.",
    images: ['/wallpaper.png'],
    creator: '@haisanngaymoi',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  // themeColor moved to generateViewport
};

export const generateViewport = () => ({
  themeColor: '#1CE7ED', // brand-crystal color
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${montserrat.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
