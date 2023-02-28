// Import necessary packages
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { MyContext, SubscriptionContext } from './lib/@types/resolversTypes.js';
import resolvers from './lib/graphQL/resolvers/index.js';
import typeDefs from './lib/graphQL/typeDefs/index.js';
import { ApolloServer } from '@apollo/server';
import { getSession } from 'next-auth/react';
import prisma from './lib/prismadb.js';
import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';

//this object will be used to publish all our events
const pubsub = new PubSub();

//loading in my environment variables
dotenv.config();
// this is how we optimize the GraphQL schema before passing it to the apollo server
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Set up Express app and http server
const app = express();
const httpServer = http.createServer(app);

// Creating the WebSocket server
const wsServer = new WebSocketServer({
	// This is the `httpServer` we created in a previous step.
	server: httpServer,
	// Pass a different path here if app.use
	// serves expressMiddleware at a different path
	path: '/graphql/subscriptions',
});

// Hand in the schema we just created and have the
// WebSocketServer start listening.
const serverCleanup = useServer(
	{
		schema,
		context: async (ctx: SubscriptionContext): Promise<MyContext> => {
			if (ctx.connectionParams && ctx.connectionParams.session) {
				const { session } = ctx.connectionParams;
				return { session, prisma, pubsub };
			}
			return { session: null, prisma, pubsub };
		}, //this is what i want to pass the my subscription resolver context, said subscriptions dont work the same as query/mutation resolvers
	},
	wsServer,
);

// Create Apollo Server instance with a custom context and the `ApolloServerPluginDrainHttpServer` plugin
const server = new ApolloServer<MyContext>({
	schema,
	introspection: process.env.NODE_ENV !== 'production',
	plugins: [
		// Proper shutdown for the HTTP server.
		ApolloServerPluginDrainHttpServer({ httpServer }),

		// Proper shutdown for the WebSocket server.
		{
			async serverWillStart() {
				return {
					async drainServer() {
						await serverCleanup.dispose();
					},
				};
			},
		},
	],
});

// Start the Apollo Server
await server.start();

// Set up middleware for Express app
app.use(
	'/',
	cors<cors.CorsRequest>({
		origin: process.env.CLIENT_ORIGIN,
		credentials: true,
	}),
	bodyParser.json(),
	expressMiddleware(server, {
		context: async ({ req }): Promise<MyContext> => {
			const session = await getSession({ req });
			return { prisma, token: 'Shaun', session, pubsub };
		},
	}),
);

// Start the http server
await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve))
	.then(() => console.log(`🚀 Server ready at http://localhost:4000/graphql`))
	.catch(error => console.log(error));
