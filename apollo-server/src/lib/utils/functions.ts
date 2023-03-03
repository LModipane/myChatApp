import { AddedUser } from '../@types/resolversTypes.js';

export function userIsConversationMember(
	addedUsers: AddedUser[],
	myUserId: string,
): boolean {
	return !!addedUsers.find(addedUser => addedUser.userId === myUserId);
}
