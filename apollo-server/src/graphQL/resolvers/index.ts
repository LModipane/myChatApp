import merge from 'lodash.merge';
import userResolvers from './users/index.js';

const resolvers = merge({}, userResolvers);

export default resolvers;
