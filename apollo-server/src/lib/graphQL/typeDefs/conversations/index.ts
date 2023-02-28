const typeDefs = `#graphql

    scalar Date

    type Mutation {
        createConversation(addedUserIds:[String!]!): CreateConversationResponse
    }

    type CreateConversationResponse {
        conversationId: ID
    }

    type Query {
        conversations: [Conversation]
    }

    type Conversation {
        id: ID!
        latestMessage: Message
        addedUsers: [AddedUser]
        createAt: Date
        updatedAt: Date
    }

    type AddedUser {
        id: ID!
        user: User
        hasSeenLatestMessage: Boolean
    }

`;

export default typeDefs;
