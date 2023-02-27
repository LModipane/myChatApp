import { MyContext } from '../../../lib/@types/resolversTypes.js';

const resolvers = {
	Mutation: {
		submitUsername: (_: unknown, { username }, { token }: MyContext) => {
			console.log(token);
			return {
				code: 200,
				success: true,
				message: 'Your username has been updated successfully',
			};
		},
	},

	Query: {
		hello: () => 'hello world',
	},
};

export default resolvers;
