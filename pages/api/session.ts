import db from "@/lib/admin/prismadb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.email) {
      throw ""
    }
  
    const currentUser = await db.user.findUnique({
      where: {
        email: session.user.email as string
      }
    })
  
    res.status(200).json(currentUser)

  } catch(e) {
    res.status(401).json({ error: 'Authentication' })
  }
}