const typeDefs = `#graphql
    type Mutation {
        submitUsername(username: String!): SubmitUsernameResponse
    }
    type SubmitUsernameResponse {
        code: Int!
        success: Boolean
        message: String
    }
    type Query {
        hello: String
    }#for some reason apollo wanted a query endpoint for the server to work 
`;
export default typeDefs;
