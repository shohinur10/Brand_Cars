import { Schema } from 'mongoose';

const ChatSchema = new Schema(
	{
		chatType: {
			type: String,
			enum: ['GLOBAL', 'ROOM', 'PRIVATE'],
			required: true,
		},
		chatName: {
			type: String,
			required: function() {
				return this.chatType === 'ROOM';
			},
		},
		chatDescription: {
			type: String,
		},
		participants: [{
			type: Schema.Types.ObjectId,
			ref: 'Member',
		}],
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		maxParticipants: {
			type: Number,
			default: 100,
		},
		settings: {
			isPublic: {
				type: Boolean,
				default: true,
			},
			allowGuests: {
				type: Boolean,
				default: true,
			},
			allowFileSharing: {
				type: Boolean,
				default: true,
			},
		},
		lastActivity: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true, collection: 'chats' },
);

// Indexes for better performance
ChatSchema.index({ chatType: 1 });
ChatSchema.index({ participants: 1 });
ChatSchema.index({ lastActivity: -1 });

export default ChatSchema;






















