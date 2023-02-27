// Import necessary packages
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import type {Session}  from 'next-auth';
import { getSession } from 'next-auth/react';
import { MyContext } from './lib/@types/resolversTypes.js';
import resolvers from './lib/graphQL/resolvers/index.js';
import typeDefs from './lib/graphQL/typeDefs/index.js';
import prisma from './lib/prismadb.js';
import dotenv from "dotenv";

//loading in my environment variables
dotenv.config();

// Set up Express app and http server
const app = express();
const httpServer = http.createServer(app);

// this is how we optimize the GraphQL schema before passing it to the apollo server
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create Apollo Server instance with a custom context and the `ApolloServerPluginDrainHttpServer` plugin
const server = new ApolloServer<MyContext>({
	schema,
	introspection: process.env.NODE_ENV !== 'production',
	plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
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
			return { prisma, token: 'Shaun', session };
		},
	}),
);

// Start the http server
await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve))
	.then(() => console.log(`🚀 Server ready at http://localhost:4000/graphql`))
	.catch(error => console.log(error));
