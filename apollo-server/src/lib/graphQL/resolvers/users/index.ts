import {
	MyContext,
	SearchedUsersArs,
	SubmitUsernameArgs,
	SubmitUsernameResponse,
} from '../../../../lib/@types/resolversTypes.js';
import type { User } from '@prisma/client';

const resolvers = {
	Query: {
		hello: () => 'hello world',
		searchUsers: async (
			_: unknown,
			{ searchedUsername }: SearchedUsersArs,
			{ prisma, session }: MyContext,
		): Promise<User[]> => {
			if (!session) throw new Error('Not autherised, please sign in');

			const { username: myUsername } = session.user;

			try {
				const users = await prisma.user.findMany({
					where: {
						username: {
							contains: searchedUsername, // this prop inputs the username into the search
							not: myUsername as string, //this prop always use to not search for our users name
							mode: 'insensitive', //this prop always us to ignore the casing of our search
						}, //this tells prisma what we are looking for
					},
				}); //look here

				return users;
			} catch (error: any) {
				//this any is here because it will be too much work and little reward to tell typescript that the error objects comes with a message prop
				console.log('search users error: ', error);
				throw new Error(error.message);
			}
		},
	},
	Mutation: {
		submitUsername: async (
			_: unknown,
			{ username }: SubmitUsernameArgs,
			{ token, session }: MyContext,
		): Promise<SubmitUsernameResponse> => {
			if (!session) {
				return {
					code: 401,
					success: false,
					message: 'Not authenticated, please sign in',
				};
			}

			try {
				const { id: myUserId } = session?.user;
				await prisma.user.update({
					where: {
						id: myUserId as string,
					}, //this prop selects the id we want to update
					data: {
						username,
					}, //this prop update the username field with the username from above
				});

				return {
					code: 200,
					message: 'Successfully submitted username',
					success: true,
				};
			} catch (error) {
				console.log('opps, error in submitting username: ', error);
				return {
					code: 500,
					success: false,
					message: error.message,
				};
			}
		},
	},
};

export default resolvers;
