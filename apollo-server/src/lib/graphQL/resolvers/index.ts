import merge from 'lodash.merge';
import userResolvers from './users/index.js';
import conversationResolvers from './conversations/index.js';

const resolvers = merge({}, userResolvers, conversationResolvers);

export default resolvers;
