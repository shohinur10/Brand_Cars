import { registerEnumType } from '@nestjs/graphql';

export enum ConversationType {
	PRIVATE = 'PRIVATE',
	GROUP = 'GROUP',
	PUBLIC = 'PUBLIC',
}
registerEnumType(ConversationType, {
	name: 'ConversationType',
});

export enum MessageType {
	TEXT = 'TEXT',
	IMAGE = 'IMAGE',
	FILE = 'FILE',
	SYSTEM = 'SYSTEM',
}
registerEnumType(MessageType, {
	name: 'MessageType',
});

export enum ChatType {
	GLOBAL = 'GLOBAL',
	ROOM = 'ROOM',
	PRIVATE = 'PRIVATE',
}
registerEnumType(ChatType, {
	name: 'ChatType',
});

export enum MessageStatus {
	SENT = 'SENT',
	DELIVERED = 'DELIVERED',
	READ = 'READ',
}
registerEnumType(MessageStatus, {
	name: 'MessageStatus',
});






















