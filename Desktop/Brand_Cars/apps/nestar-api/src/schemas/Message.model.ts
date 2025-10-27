import { Schema } from 'mongoose';

const MessageSchema = new Schema(
	{
		conversationId: {
			type: Schema.Types.ObjectId,
			ref: 'Conversation',
			required: true,
		},
		senderId: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
			required: true,
		},
		messageType: {
			type: String,
			enum: ['TEXT', 'IMAGE', 'FILE', 'SYSTEM'],
			default: 'TEXT',
		},
		content: {
			type: String,
			required: true,
		},
		attachments: [{
			fileName: String,
			fileUrl: String,
			fileType: String,
			fileSize: Number,
		}],
		replyTo: {
			type: Schema.Types.ObjectId,
			ref: 'Message',
		},
		isEdited: {
			type: Boolean,
			default: false,
		},
		editedAt: {
			type: Date,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		deletedAt: {
			type: Date,
		},
		readBy: [{
			userId: {
				type: Schema.Types.ObjectId,
				ref: 'Member',
			},
			readAt: {
				type: Date,
				default: Date.now,
			},
		}],
		reactions: [{
			userId: {
				type: Schema.Types.ObjectId,
				ref: 'Member',
			},
			emoji: String,
			createdAt: {
				type: Date,
				default: Date.now,
			},
		}],
	},
	{ timestamps: true, collection: 'messages' },
);

// Indexes for better performance
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ isDeleted: 1 });

export default MessageSchema;


















