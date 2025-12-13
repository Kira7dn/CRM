import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";
import { ThemeProvider } from "@/app/(features)/crm/campaigns/posts/_components/scheduler/theme-provider";
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
  metadataBase: new URL('https://crm.linkstrategy.io.vn'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Hải sản Ngày mới Cô Tô - Hải sản tươi ngon từ biển Cô Tô",
    description: "Hải sản tươi sống, đông lạnh và chế biến sẵn từ Cô Tô. Cam kết chất lượng, giao hàng nhanh tại khu vực Đông Bắc Bộ.",
    url: 'https://crm.linkstrategy.io.vn',
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
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > */}
        <CopilotKit runtimeUrl="/api/copilotkit" publicLicenseKey="ck_pub_9f183f4c59f3d2b59e41ff75d5aace3e">
          {children}
        </CopilotKit>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
