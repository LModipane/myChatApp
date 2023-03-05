import type { PrismaClient, Prisma } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import { Context } from 'graphql-ws';
import type { Session } from 'next-auth';
import {
	populatedAddedUsers,
	populatedConversation,
} from '../graphQL/resolvers/conversations/index.js';
import { populatedMessage } from  "../graphQL/resolvers/messages/index.js"

export type MyContext = {
	token?: string;
	prisma: PrismaClient;
	session: Session | null;
	pubsub: PubSub;
};

export type SubmitUsernameArgs = {
	username: string;
};

export type SubmitUsernameResponse = {
	code: number;
	success: boolean;
	message: string;
};

export type SearchedUsersArs = {
	searchedUsername: string;
};

export type CreateConversationArgs = {
	addedUserIds: [string];
};

export type Conversation = Prisma.ConversationGetPayload<{
	include: typeof populatedConversation;
}>;

export type AddedUser = Prisma.ConversationMemberGetPayload<{
	include: typeof populatedAddedUsers;
}>;

export interface SubscriptionContext extends Context {
	connectionParams: {
		session?: Session;
	};
}

export type ConversationCreatedSubscriptionPayload = {
	conversationCreated: Conversation;
};

export type SendMessageArgs = {
	senderId: string;
	conversationId: string;
	body: string;
};

export type MessageSentSubscriptionPayload = {
	messageSent: PopulatedMessage;
};

export type PopulatedMessage = Prisma.MessageGetPayload<{
	include: typeof populatedMessage
}>

export type MessageSentArgs = {
	conversationId: string
}

export type MessagesArgs = {
	conversationId: string
}