import { PrismaClient, Prisma, StatusType } from '@prisma/client'

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

const getUserProfileData = (userIds: number[]): Prisma.ProfileCreateInput[] => [
	{
		user: {
			connect: {
				id: userIds[0],
			},
		},
		tag: 'rero0124',
		information: '',
		statusType: StatusType.common,
		statusId: 0,
	},
	{
		user: {
			connect: {
				id: userIds[0],
			},
		},
		tag: 'rero01211',
		information: '',
		statusType: StatusType.common,
		statusId: 0,
	},
	{
		user: {
			connect: {
				id: userIds[1],
			},
		},
		tag: '테스트',
		information: '테스트 입니다.',
		statusType: StatusType.common,
		statusId: 0,
	},
	{
		user: {
			connect: {
				id: userIds[1],
			},
		},
		tag: '테스트1',
		information: '',
		statusType: StatusType.custom,
		statusId: 0,
	},
]

const getRoomData = (userProfileIds: number[]): Prisma.RoomCreateInput[] => [
	{
		name: '테스트',
		masterProfile: {
			connect: {
				id: userProfileIds[0],
			},
		},
		iconType: 'text',
		iconData: '테스트',
		participant: {
			createMany: {
				data: [
					{
						profileId: userProfileIds[0],
					},
					{
						profileId: userProfileIds[1],
					},
					{
						profileId: userProfileIds[2],
					},
				],
			},
		},
	},
	{
		name: '테스트2',
		masterProfile: {
			connect: {
				id: userProfileIds[3],
			},
		},
		iconType: 'text',
		iconData: '테스트2',
		participant: {
			createMany: {
				data: [
					{
						profileId: userProfileIds[0],
					},
					{
						profileId: userProfileIds[1],
					},
					{
						profileId: userProfileIds[3],
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
		await prisma.profile.create({ data: up })
	}

	const userProfileIds = (await prisma.profile.findMany()).map((u) => u.id)

	const roomData = getRoomData(userProfileIds)

	for (const r of roomData) {
		await prisma.room.create({ data: r })
	}
}

main()
