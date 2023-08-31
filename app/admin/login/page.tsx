import LoginContentAdmin from '@/components/admin/content/LoginContentAdmin'
import { useCurrentUserAdmin } from '@/lib/admin/helperServer'
import { redirect } from 'next/navigation'

const page = async () => {
  const data = await useCurrentUserAdmin()

  if (data) {
    redirect('/admin')
  }

  return <LoginContentAdmin />
}

export default page