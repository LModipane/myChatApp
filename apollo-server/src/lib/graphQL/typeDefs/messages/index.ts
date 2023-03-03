const typeDefs = `#graphql
    scalar Data
    type Message {
        createAt: Date
        id: ID!
        sender: User
        body: String
    }

    type Mutation {
        sendMessage(messageId: ID!, conversationId: ID!, senderId:ID!, body: String): Boolean
    }

    type Subscription {
        messageSent(conversationId: ID!): Message
    }
`;

export default typeDefs;
