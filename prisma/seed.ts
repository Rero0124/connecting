import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = [
	{
		email: 'rero0124@icloud.com',
		password: '$2b$10$oTix98E0LKX5NE9akIhWT.SZZm3PC50w/ULWR9dcrWNjNOrbJO1Zy',
	},
	{
		email: 'test@test.com',
		password: '$2b$10$oTix98E0LKX5NE9akIhWT.SZZm3PC50w/ULWR9dcrWNjNOrbJO1Zy',
	},
]

const getUserProfileData = (
	userIds: number[]
): Prisma.UserProfileCreateInput[] => [
	{
		user: {
			connect: {
				id: userIds[0],
			},
		},
		userTag: 'rero0124',
	},
	{
		user: {
			connect: {
				id: userIds[0],
			},
		},
		userTag: 'rero01211',
	},
	{
		user: {
			connect: {
				id: userIds[1],
			},
		},
		userTag: '테스트',
	},
	{
		user: {
			connect: {
				id: userIds[1],
			},
		},
		userTag: '테스트1',
	},
]

const getRoomData = (userProfileIds: number[]): Prisma.RoomCreateInput[] => [
	{
		name: '테스트',
		master: {
			connect: {
				id: userProfileIds[0],
			},
		},
		profileType: 'text',
		profileData: '테스트',
		roomUser: {
			createMany: {
				data: [
					{
						userProfileId: userProfileIds[0],
					},
					{
						userProfileId: userProfileIds[1],
					},
					{
						userProfileId: userProfileIds[2],
					},
				],
			},
		},
	},
	{
		name: '테스트2',
		master: {
			connect: {
				id: userProfileIds[3],
			},
		},
		profileType: 'text',
		profileData: '테스트2',
		roomUser: {
			createMany: {
				data: [
					{
						userProfileId: userProfileIds[0],
					},
					{
						userProfileId: userProfileIds[1],
					},
					{
						userProfileId: userProfileIds[3],
					},
				],
			},
		},
	},
]

export async function main() {
	for (const u of userData) {
		await prisma.user.create({ data: u })
	}

	const userIds = (await prisma.user.findMany()).map((u) => u.id)

	const userProfileData = getUserProfileData(userIds)

	for (const up of userProfileData) {
		await prisma.userProfile.create({ data: up })
	}

	const userProfileIds = (await prisma.userProfile.findMany()).map((u) => u.id)

	const roomData = getRoomData(userProfileIds)

	for (const r of roomData) {
		await prisma.room.create({ data: r })
	}
}

main()
