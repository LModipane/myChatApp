import merge from 'lodash.merge';
import userResolvers from './users/index.js';
import conversationResolvers from './conversations/index.js';
import MessageResolver from './messages/index.js';

const resolvers = merge(
	{},
	userResolvers,
	conversationResolvers,
	MessageResolver,
);

export default resolvers;
