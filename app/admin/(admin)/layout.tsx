import AdminLayout from 'components/admin/AdminLayout';
import { cookies } from 'next/headers';
import React from 'react';
import { useCurrentUserAdmin } from '@/lib/admin/helperServer';
import ClientOnly from '@/components/ClientOnly';
import { redirect } from 'next/navigation';
import { getSettingsData } from '@/lib/admin/sample';

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // const { user: data } = await getData()

  // console.log(data)

  const user = await useCurrentUserAdmin()

  if (user == null) {
    redirect('/admin/login')
  }

  return (
    // <ClientOnly>
      <AdminLayout userData={user} >
        {children}
      </AdminLayout>
    // </ClientOnly>
  )
}