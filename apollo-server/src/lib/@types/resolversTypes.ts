import type { PrismaClient } from '@prisma/client';
import type { Session } from 'next-auth';

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
}
