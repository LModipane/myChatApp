import { Session } from 'next-auth';

declare module 'next-auth' {
	interface Session {
		user: User;
	}

	interface User {
		id: String;
		username: String;
	}
} //these types will be combined with the exissting User and Session interfaces rather than replacing them

export default Session;
