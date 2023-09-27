import { findSettingByName } from '@/lib/admin/fields';
import { getSettingsData } from '@/lib/admin/sample';
import { Metadata, ResolvingMetadata } from 'next';
import { ReactNode } from "react";

export async function generateMetadata(
  parent?: ResolvingMetadata
): Promise<Metadata> {
  const settings = await getSettingsData()

  const title = findSettingByName(settings, "admin title")
  const description = findSettingByName(settings, "admin description")
  const logo = findSettingByName(settings, "admin logo")
 
  return {
    metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
    title: title || "Việt Hùng It",
    description: description || 'Việt Hùng It lập trình viên web, mobile, hệ thống',
    authors: {
      name: 'Việt Hùng It',
      url: 'https://github.com/rowdy-dowdy'
    },
    twitter: {
      title: title || "Việt Hùng It",
      description: description || 'Việt Hùng It lập trình viên web, mobile, hệ thống',
      images: logo ? logo?.url : null,
    },
    openGraph: {
      title: title || "Việt Hùng It",
      description: description || 'Việt Hùng It lập trình viên web, mobile, hệ thống',
      url: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
      siteName: title || "Việt Hùng It",
      images: logo ? logo?.url : null,
      type: 'website',
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
