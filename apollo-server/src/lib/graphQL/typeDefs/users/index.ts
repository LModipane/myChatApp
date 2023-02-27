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
        searchUsers(searchedUsername: String!): [SearchedUser]
    }#for some reason apollo wanted a query endpoint for the server to work 

    type SearchedUser{
        id: ID!
        username: String!
    }

`;
export default typeDefs;
