import {
	CreateConversationArgs,
	MyContext,
	Conversation,
	ConversationCreatedSubscriptionPayload,
} from '../../../@types/resolversTypes.js';
import { ApolloError } from 'apollo-server-core';
import { Prisma } from '@prisma/client';
import { withFilter } from 'graphql-subscriptions';
const resolvers = {
	Query: {
		conversations: async (
			_: unknown,
			__: unknown,
			{ prisma, session }: MyContext,
		): Promise<Conversation[]> => {
			if (!session) throw new ApolloError('Not authorised, please sign in');
			const myUserId = session.user.id as string;
			try {
				/**
				 * Find all conversation the myUser is a member of
				 */
				const conversations = await prisma.conversation.findMany({
					/**
					 * Below is the correct query to find all conversations that myUser is a member of
					 * confirmed by the prisma team. They have confiremed this is an issue on thier end
					 * which is specfic with mongodb
					 */
					// where: {
					// 	addedUsers: {
					// 		some: {
					// 			userId: {
					// 				equals: myUserId as string,
					// 			}
					// 		}
					// 	}
					// },
					include: populatedConversation,
				});

				return conversations.filter(
					conversation =>
						!!conversation.addedUsers.find(
							addedUser => addedUser.userId === myUserId,
						),
				);
			} catch (error) {
				console.log('opps, query conversations: ', error);
				throw new ApolloError('failed to query conversations');
			}
		},
	},
	Mutation: {
		createConversation: async (
			_: unknown,
			{ addedUserIds }: CreateConversationArgs,
			{ prisma, session, pubsub }: MyContext,
		): Promise<{ conversationId: string }> => {
			if (!session) throw new ApolloError('Not authorised, please sign in');

			const { id: myUserId } = session.user;

			const conversationMembers = addedUserIds.map(id => ({
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

				pubsub.publish('CONVERSATION_CREATED', {
					conversationCreated: conversation,
				});

				return { conversationId: conversation.id };
			} catch (error) {
				console.log('opps, created conversation error: ', error);
				throw new ApolloError('failed to create conversation');
			}
		},
	},
	Subscription: {
		conversationCreated: {
			subscribe: withFilter(
				(_: unknown, __: unknown, { pubsub }: MyContext) => {
					return pubsub.asyncIterator(['CONVERSATION_CREATED']);
				},
				(
					payload: ConversationCreatedSubscriptionPayload,
					_: unknown,
					{ session }: MyContext,
				) => {
					const { id: myUserId } = session.user;
					const { addedUsers } = payload.conversationCreated;
					const isMyUserInConversation = !!addedUsers.find(
						addedUser => addedUser.userId === myUserId,
					);
					return isMyUserInConversation;
				},
			),
		},
	},
};

export default resolvers;

export const populatedAddedUsers =
	Prisma.validator<Prisma.ConversationMemberInclude>()({
		user: {
			select: {
				id: true,
				username: true,
			},
		},
	});

export const populatedConversation =
	Prisma.validator<Prisma.ConversationInclude>()({
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
	}); //this is exported so that it is available in the prisma object
