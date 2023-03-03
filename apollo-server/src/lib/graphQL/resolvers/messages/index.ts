import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { withFilter } from 'graphql-subscriptions';
import {
	MessagesArgs,
	MessageSentArgs,
	MessageSentSubscriptionPayload,
	MyContext,
	PopulatedMessage,
	SendMessageArgs,
} from '../../../@types/resolversTypes.js';
import { userIsConversationMember } from '../../../utils/functions.js';
import { populatedConversation } from '../conversations/index.js';

const resolvers = {
	Query: {
		messages: async (
			_: unknown,
			{ conversationId }: MessagesArgs,
			{ prisma, session }: MyContext,
		): Promise<PopulatedMessage[]> => {
			if (!session) throw new GraphQLError('Not Authorised');
			const { id: myUserId } = session.user;

			const conversation = await prisma.conversation.findUnique({
				where: {
					id: conversationId,
				},
				include: populatedConversation,
			});
			/**
			 * verify that the conversation exist and myUser can view messages
			 */
			if (!conversation) throw new GraphQLError('Conversation not found');

			const { addedUsers } = conversation;
			const allowToViewMessage = userIsConversationMember(
				addedUsers,
				myUserId as string,
			);
			if (!allowToViewMessage) throw new GraphQLError('Not authorized');

			/**
			 * fetch messages
			 */

			try {
				const messages = await prisma.message.findMany({
					where: {
						conversationId,
					},
					include: populatedMessage,
					orderBy: {
						creeateAt: 'desc',
					},
				});
				return messages;
			} catch (error) {
				console.log('Opps, messages error: ', error);
				throw new GraphQLError('failed to fetch messages');
			}
		},
	},
	Mutation: {
		sendMessage: async (
			_: unknown,
			{ messageId, body, conversationId, senderId }: SendMessageArgs,
			{ prisma, session, pubsub }: MyContext,
		): Promise<boolean> => {
			if (!session) throw new GraphQLError('Not Authorised');
			const { id: myUserId } = session.user;
			if (myUserId !== senderId) throw new GraphQLError('Not Authorised'); //this prevents other users from sending messages for outher users

			try {
				/**
				 * create new message object in DB
				 */
				const newMessage = await prisma.message.create({
					data: {
						id: messageId,
						senderId,
						conversationId,
						body,
					},
					include: populatedMessage,
				});

				/**
				 * update conversation object to incluse the new message
				 */
				const conversation = await prisma.conversation.update({
					where: {
						id: conversationId,
					},
					data: {
						latestMessageId: newMessage.id,
						addedUsers: {
							update: {
								where: {
									id: senderId,
								},
								data: {
									hasSeenLatestMessage: true,
								},
							},
							updateMany: {
								where: {
									NOT: {
										userId: senderId,
									},
								},
								data: {
									hasSeenLatestMessage: false,
								},
							},
						},
					},
				});
				/**
				 * publish update conversation event and message sent event
				 */
				pubsub.publish('MESSAGE_SENT', {
					messageSent: newMessage,
				});
				// pubsub.publish("CONVERSATION_UPDATED", {
				// 	conversationUpdated: {conversation}
				// })
			} catch (error) {
				console.log('Opps sendMessage error: ', error);
				throw new Error('failed to send message');
			}

			return true;
		},
	},
	Subscription: {
		messageSent: {
			subscribe: withFilter(
				(_: unknown, __: unknown, { pubsub }: MyContext) => {
					return pubsub.asyncIterator(['MESSAGE_SENT']);
				},
				(
					payload: MessageSentSubscriptionPayload,
					{ conversationId }: MessageSentArgs,
				) => {
					return payload.messageSent.conversationId === conversationId;
				},
			),
		},
	},
};

export default resolvers;

export const populatedMessage = Prisma.validator<Prisma.MessageInclude>()({
	sender: {
		select: {
			id: true,
			username: true,
		},
	},
});
