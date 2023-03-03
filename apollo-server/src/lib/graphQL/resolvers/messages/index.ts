import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { withFilter } from 'graphql-subscriptions';
import {
	MessageSentArgs,
	MessageSentSubscriptionPayload,
	MyContext,
	SendMessageArgs,
} from '../../../@types/resolversTypes.js';

const resolvers = {
	Query: {},
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
