import LoginContentAdmin from '@/components/admin/content/LoginContentAdmin'
import { useCurrentUserAdmin } from '@/lib/admin/helperServer'
import { redirect } from 'next/navigation'

const page = async ({
  searchParams
}: {
  searchParams: { [key: string]: string | undefined },
}) => {
  const data = await useCurrentUserAdmin()

  if (data) {
    const url = searchParams?.url || '/admin'
    redirect(url)
  }

  return <LoginContentAdmin />
}

export default page