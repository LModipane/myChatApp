// Import necessary packages
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { makeExecutableSchema } from '@graphql-tools/schema';
// import { typeDefs, resolvers } from './schema';

const typeDefs = `#graphql
    type Query {
        hello: String
    }
`;

const resolvers = {
	Query: {
		hello: () => 'Hello, world!',
	},
};

// Define a custom context interface
interface MyContext {
	token?: string;
}

// Set up Express app and http server
const app = express();
const httpServer = http.createServer(app);

const schema = makeExecutableSchema({typeDefs, resolvers});

// Create Apollo Server instance with a custom context and the `ApolloServerPluginDrainHttpServer` plugin
const server = new ApolloServer<MyContext>({
	schema,
	plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Start the Apollo Server
await server.start();

// Set up middleware for Express app
app.use(
	'/',
	cors<cors.CorsRequest>(),
	bodyParser.json(),
	expressMiddleware(server, {
		context: async ({ req }) => ({ token: req.headers.token }),
	}),
);

// Start the http server
await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/`);
