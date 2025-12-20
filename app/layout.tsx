import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { CopilotKit } from "@copilotkit/react-core";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "@copilotkit/react-ui/styles.css";
import "./globals.css";
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkStrategy - Giải pháp Công nghệ AI & Automation",
  description: "LinkStrategy chuyên phát triển phần mềm, phân tích nghiệp vụ khách hàng, tư vấn và cung cấp giải pháp AI, Automation cho marketing, ERP, CMS, EMS. Tối ưu hóa quy trình kinh doanh với công nghệ tiên tiến.",
  keywords: [
    "LinkStrategy",
    "phát triển phần mềm",
    "AI",
    "Automation",
    "tư vấn công nghệ",
    "phân tích nghiệp vụ",
    "marketing automation",
    "ERP",
    "CMS",
    "EMS",
    "giải pháp doanh nghiệp",
    "chuyển đổi số",
    "tối ưu hóa quy trình",
    "AI integration",
    "business intelligence"
  ],
  authors: [{ name: "LinkStrategy" }],
  creator: "LinkStrategy",
  publisher: "LinkStrategy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://crm.linkstrategy.io.vn'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "LinkStrategy - Giải pháp Công nghệ AI & Automation cho Doanh nghiệp",
    description: "LinkStrategy chuyên phát triển phần mềm, phân tích nghiệp vụ khách hàng, tư vấn và cung cấp giải pháp AI, Automation cho marketing, ERP, CMS, EMS. Tối ưu hóa quy trình kinh doanh với công nghệ tiên tiến.",
    url: 'https://crm.linkstrategy.io.vn',
    siteName: 'LinkStrategy',
    images: [
      {
        url: '/wallpaper.png',
        width: 1200,
        height: 630,
        alt: 'LinkStrategy - Giải pháp Công nghệ AI & Automation',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "LinkStrategy - Giải pháp Công nghệ AI & Automation cho Doanh nghiệp",
    description: "LinkStrategy chuyên phát triển phần mềm, phân tích nghiệp vụ khách hàng, tư vấn và cung cấp giải pháp AI, Automation cho marketing, ERP, CMS, EMS. Tối ưu hóa quy trình kinh doanh với công nghệ tiên tiến.",
    images: ['/wallpaper.png'],
    creator: '@linkstrategy',
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
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.png',
  },
  // themeColor moved to generateViewport
};

export const generateViewport = () => ({
  themeColor: '#1CE7ED', // brand-crystal color
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
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
        <SpeedInsights />
      </body>
    </html>
  );
}
