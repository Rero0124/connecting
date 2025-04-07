import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = [
  {
    name: 'rero0124',
    email: 'rero0124@icloud.com',
    password: '1234'
  },
  {
    name: 'test',
    email: 'test@test.com',
    password: '1234',
  }
]

const getRoomData = (userIds: number[]): Prisma.RoomCreateInput[] => [
  {
    name: '테스트',
    master: {
      connect: {
        email: 'test@test.com'
      }
    },
    roomUser: {
      createMany: {
        data: [
          {
            userId: userIds[0]
          },
          {
            userId: userIds[1]
          }
        ]
      }
    }
  }
]

export async function main () {
  for(const u of userData) {
    await prisma.user.create({ data: u })
  }

  const userIds = (await prisma.user.findMany()).map((u) => u.id)

  const roomData = getRoomData(userIds)

  for(const r of roomData) {
    await prisma.room.create({ data: r })
  }
}

main()