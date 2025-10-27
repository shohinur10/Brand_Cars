import { Schema } from 'mongoose';

const ConversationSchema = new Schema(
	{
		conversationType: {
			type: String,
			enum: ['PRIVATE', 'GROUP', 'PUBLIC'],
			required: true,
		},
		participants: [{
			type: Schema.Types.ObjectId,
			ref: 'Member',
			required: true,
		}],
		lastMessage: {
			type: Schema.Types.ObjectId,
			ref: 'Message',
		},
		lastMessageAt: {
			type: Date,
			default: Date.now,
		},
		conversationName: {
			type: String,
			required: function() {
				return this.conversationType === 'GROUP';
			},
		},
		conversationDescription: {
			type: String,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		unreadCount: {
			type: Map,
			of: Number,
			default: new Map(),
		},
	},
	{ timestamps: true, collection: 'conversations' },
);

// Indexes for better performance
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ conversationType: 1 });

export default ConversationSchema;


















