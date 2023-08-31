import db from "@/lib/admin/prismadb"
import { NextApiRequest, NextApiResponse } from "next"
import { Server, Socket } from "socket.io";

export default async (req: NextApiRequest, res: any) => {
  if (res.socket?.server.io) {
    res.end()
    return
  }

  const io = new Server(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false
  })

  res.socket.server.io = io

  const onConnection = async (socket: Socket) => {
    // admin socket
    if (socket.handshake.query.role != 'admin') {
      const userAgent = socket.handshake.headers['user-agent']
      const forwarded = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address
      const ip = typeof forwarded == "string" ? forwarded.split(/, /)[0] : req.socket.remoteAddress

      // Kiểm tra chuỗi User Agent để ước tính loại thiết bị
      let deviceType = 'PC'

      if (userAgent?.match(/Mobile|Android|iPhone|iPod|BlackBerry|Opera Mini|IEMobile|WPDesktop/i)) {
        deviceType = 'Mobile'
      } else if (userAgent?.match(/Tablet|iPad|Nexus 7/i)) {
        deviceType = 'Tablet'
      }

      await db.accessHistory.create({
        data: {
          id: socket.id,
          device: deviceType,
          ip: ip
        }
      })

      socket.on('disconnect', async () => {
        await db.accessHistory.update({
          where: {
            id: socket.id
          },
          data: {
            timeToLeave: new Date()
          }
        })
      })
    }
  }

  io.on('connection', onConnection)

  console.log('Socket server started successfully!')
  res.end()
}