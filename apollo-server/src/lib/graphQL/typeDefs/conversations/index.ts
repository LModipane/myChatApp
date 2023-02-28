const typeDefs = `#graphql

    type Mutation {
        createConversation(addedUsersIds:[String!]!): CreateConversationResponse
    }

    type CreateConversationResponse {
        conversationId: ID
    }

`;

export default typeDefs;
