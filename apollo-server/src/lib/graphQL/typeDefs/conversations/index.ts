const typeDefs = `#graphql

    scalar Data

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
        createAt: Data
        updatedAt: Data
    }

    type AddedUser {
        id: ID!
        user: User
        hasSeenLatestMessage: boolean
    }

`;

export default typeDefs;
