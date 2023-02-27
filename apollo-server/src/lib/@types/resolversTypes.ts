import type { PrismaClient } from "@prisma/client";


export type MyContext = {
	token?: string;
	prisma: PrismaClient
}
