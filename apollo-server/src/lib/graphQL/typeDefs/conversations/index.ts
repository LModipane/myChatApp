const typeDefs = `#graphql

    type Mutation {
        createConversation(addedUserIds:[String!]!): CreateConversationResponse
    }

    type CreateConversationResponse {
        conversationId: ID
    }

`;

export default typeDefs;
