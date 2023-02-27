import {
	MyContext,
	SubmitUsernameArgs,
	SubmitUsernameResponse,
} from '../../../../lib/@types/resolversTypes.js';

const resolvers = {
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

	Query: {
		hello: () => 'hello world',
	},
};

export default resolvers;
