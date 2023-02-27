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
        searchUsers(searchedUsername: String!): [SearchedUsers]
    }#for some reason apollo wanted a query endpoint for the server to work 

    type SearchedUsers{
        id: ID!
        username: String!
    }

`;
export default typeDefs;
