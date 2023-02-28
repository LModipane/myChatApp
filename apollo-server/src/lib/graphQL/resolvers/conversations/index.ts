import {
	CreateConversationArgs,
	MyContext,
} from '../../../@types/resolversTypes.js';
import { ApolloError } from 'apollo-server-core';
import { Prisma } from '@prisma/client';
const resolvers = {
	Mutation: {
		createConversation: async (
			_: unknown,
			{ addedUsersIds }: CreateConversationArgs,
			{ prisma, session }: MyContext,
		): Promise<{ conversationId: string }> => {
			if (!session) throw new ApolloError('Not authorised, please sign in');

			const { id: myUserId } = session.user;

			const conversationMembers = addedUsersIds.map(id => ({
				userId: id,
				hasSeenLatestMessage: id === myUserId,
			}));

			try {
				const conversation = await prisma.conversation.create({
					data: {
						addedUsers: {
							createMany: {
								data: conversationMembers,
							},
						},
					},
					include: populatedConversation,
				});

				/**
				 * publish created coversation event 
				 */

				return { conversationId: conversation.id };
			} catch (error) {
				console.log('opps, created conversation error: ', error);
				throw new ApolloError('failed to create conversation');
			}
		},
	},
};

export default resolvers;

const populatedAddedUsers =
	Prisma.validator<Prisma.ConversationMemberInclude>()({
		user: {
			select: {
				id: true,
				username: true,
			},
		},
	});

const populatedConversation = Prisma.validator<Prisma.ConversationInclude>()({
	addedUsers: {
		include: populatedAddedUsers,
	},
	latestMesssage: {
		include: {
			sender: {
				select: {
					id: true,
					username: true,
				},
			},
		},
	},
});
