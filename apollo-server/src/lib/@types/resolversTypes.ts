import type { PrismaClient, Prisma } from "@prisma/client";
import type { Session } from 'next-auth';
import { populatedConversation } from "../graphQL/resolvers/conversations/index.js";

export type MyContext = {
	token?: string;
	prisma: PrismaClient;
	session: Session | null;
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
	include: typeof populatedConversation
}>;
