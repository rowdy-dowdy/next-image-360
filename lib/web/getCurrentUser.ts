import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import db from "../admin/prismadb";
import { User } from "@prisma/client";
import { exclude } from "../utils/helper";

export type UserType = Omit<User, "password">| null

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  try {
    const session = await getSession()

    if (!session?.user?.email) {
      return null
    }

    const currentUser = await db.user.findUnique({
      where: {
        email: session.user.email as string
      }
    })

    const userWithoutPassword: UserType = exclude(currentUser, ['password'])

    return userWithoutPassword

  } catch (error: any) {
    return null
  }
}