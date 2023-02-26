// Import necessary packages
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { makeExecutableSchema } from '@graphql-tools/schema';
import resolvers from './graphQL/resolvers/index.js';
import typeDefs from './graphQL/typeDefs/index.js';

// Define a custom context interface
interface MyContext {
	token?: string;
}

// Set up Express app and http server
const app = express();
const httpServer = http.createServer(app);

// this is how we optimize the GraphQL schema before passing it to the apollo server
const schema = makeExecutableSchema({ typeDefs, resolvers });

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
await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve))
	.then(() => console.log(`🚀 Server ready at http://localhost:4000/graphql`))
	.catch(error => console.log(error));
