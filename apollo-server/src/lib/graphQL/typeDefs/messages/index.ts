const typeDefs = `#graphql
    scalar Data
    type Message {
        createAt: Date
        id: ID!
        sender: User
        body: String
    }
`;

export default typeDefs;
