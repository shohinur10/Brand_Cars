import { Logger, UseGuards } from '@nestjs/common';
import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import * as url from 'url';
import { AuthService } from '../components/auth/auth.service';
import { ChatService } from '../components/chat/chat.service';
import { Member } from '../libs/dto/member';
import { MessageInput } from '../libs/dto/chat/message.input';
import { MessageReactionInput } from '../libs/dto/chat/message.input';
import { MessageType } from '../libs/enums/chat.enum';
import { ObjectId } from 'mongoose';

interface AuthenticatedSocket extends WebSocket {
  user?: Member;
  userId?: string;
  currentRoom?: string;
}

interface ChatMessagePayload {
  conversationId: string;
  content: string;
  messageType?: MessageType;
  replyTo?: string;
  attachments?: any[];
}

interface TypingPayload {
  conversationId: string;
  isTyping: boolean;
}

interface JoinRoomPayload {
  conversationId: string;
}

interface MessageReactionPayload {
  messageId: string;
  emoji: string;
}

@WebSocketGateway({ 
  transports: ['websocket'], 
  secure: false,
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class EnhancedSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('EnhancedSocketGateway');
  private total: number = 0;
  private clientAuthMap = new Map<AuthenticatedSocket, Member | null>();
  private roomMembers = new Map<string, Set<AuthenticatedSocket>>();
  private typingUsers = new Map<string, Set<string>>(); // conversationId -> Set of userIds

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
  ) {}

  @WebSocketServer()
  server: Server;

  public afterInit(server: Server) {
    this.logger.verbose(`Enhanced WebSocket Gateway Started: total: ${this.total}`);
  }

  public async handleConnection(client: AuthenticatedSocket, req: any) {
    const authMember = await this.retrieveMember(req);
    this.total++;
    this.clientAuthMap.set(client, authMember);
    
    if (authMember) {
      client.user = authMember;
      client.userId = authMember._id.toString();
    }

    const clientNick: string = authMember?.memberNick ?? 'guest';

    this.logger.verbose(
      `WebSocket Connection ${clientNick} Running: total: ${this.total}`,
    );

    // Send connection confirmation
    client.send(JSON.stringify({
      event: 'connected',
      user: authMember,
      totalClients: this.total,
    }));

    // Join global room by default
    this.joinRoom(client, 'global');
  }

  public handleDisconnect(client: AuthenticatedSocket) {
    const authMember = this.clientAuthMap.get(client);
    this.total--;
    this.clientAuthMap.delete(client);

    // Leave all rooms
    if (client.currentRoom) {
      this.leaveRoom(client, client.currentRoom);
    }

    const clientNick: string = authMember?.memberNick ?? 'guest';
    this.logger.warn(`Disconnection: ${clientNick} total: ${this.total}`);

    // Notify global room about disconnection
    this.broadcastToRoom('global', {
      event: 'user_left',
      user: authMember,
      totalClients: this.total,
    });
  }

  // ==================== ROOM MANAGEMENT ====================

  @SubscribeMessage('join_room')
  public handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomPayload,
  ): void {
    this.joinRoom(client, payload.conversationId);
  }

  @SubscribeMessage('leave_room')
  public handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomPayload,
  ): void {
    this.leaveRoom(client, payload.conversationId);
  }

  private joinRoom(client: AuthenticatedSocket, roomId: string): void {
    // Leave current room if any
    if (client.currentRoom) {
      this.leaveRoom(client, client.currentRoom);
    }

    // Join new room
    if (!this.roomMembers.has(roomId)) {
      this.roomMembers.set(roomId, new Set());
    }
    
    this.roomMembers.get(roomId)!.add(client);
    client.currentRoom = roomId;

    const authMember = this.clientAuthMap.get(client);
    this.logger.verbose(`${authMember?.memberNick || 'guest'} joined room: ${roomId}`);

    // Notify room members
    this.broadcastToRoom(roomId, {
      event: 'user_joined_room',
      user: authMember,
      roomId: roomId,
    }, client);

    // Send room info to client
    client.send(JSON.stringify({
      event: 'room_joined',
      roomId: roomId,
      members: Array.from(this.roomMembers.get(roomId) || []).map(c => this.clientAuthMap.get(c)),
    }));
  }

  private leaveRoom(client: AuthenticatedSocket, roomId: string): void {
    const room = this.roomMembers.get(roomId);
    if (room) {
      room.delete(client);
      if (room.size === 0) {
        this.roomMembers.delete(roomId);
      }
    }

    client.currentRoom = undefined;

    const authMember = this.clientAuthMap.get(client);
    this.logger.verbose(`${authMember?.memberNick || 'guest'} left room: ${roomId}`);

    // Notify room members
    this.broadcastToRoom(roomId, {
      event: 'user_left_room',
      user: authMember,
      roomId: roomId,
    });
  }

  // ==================== MESSAGING ====================

  @SubscribeMessage('send_message')
  public async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ChatMessagePayload,
  ): Promise<void> {
    const authMember = this.clientAuthMap.get(client);
    
    if (!authMember) {
      client.send(JSON.stringify({
        event: 'error',
        message: 'Authentication required to send messages',
      }));
      return;
    }

    try {
      // Create message in database
      const messageInput: MessageInput = {
        conversationId: payload.conversationId as any,
        content: payload.content,
        messageType: payload.messageType || MessageType.TEXT,
        replyTo: payload.replyTo as any,
        attachments: payload.attachments,
      };

      const message = await this.chatService.createMessage(authMember._id, messageInput);

      // Broadcast message to room
      this.broadcastToRoom(payload.conversationId, {
        event: 'new_message',
        message: message,
        sender: authMember,
      });

      this.logger.verbose(`Message sent by ${authMember.memberNick} in room ${payload.conversationId}`);
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      client.send(JSON.stringify({
        event: 'error',
        message: 'Failed to send message',
      }));
    }
  }

  @SubscribeMessage('typing')
  public handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: TypingPayload,
  ): void {
    const authMember = this.clientAuthMap.get(client);
    
    if (!authMember) {
      return;
    }

    const { conversationId, isTyping } = payload;
    
    if (isTyping) {
      if (!this.typingUsers.has(conversationId)) {
        this.typingUsers.set(conversationId, new Set());
      }
      this.typingUsers.get(conversationId)!.add(authMember._id.toString());
    } else {
      this.typingUsers.get(conversationId)?.delete(authMember._id.toString());
    }

    // Broadcast typing status to room (except sender)
    this.broadcastToRoom(conversationId, {
      event: 'typing_status',
      conversationId: conversationId,
      typingUsers: Array.from(this.typingUsers.get(conversationId) || []),
      user: authMember,
      isTyping: isTyping,
    }, client);

    // Clear typing status after 3 seconds
    if (isTyping) {
      setTimeout(() => {
        this.typingUsers.get(conversationId)?.delete(authMember._id.toString());
        this.broadcastToRoom(conversationId, {
          event: 'typing_status',
          conversationId: conversationId,
          typingUsers: Array.from(this.typingUsers.get(conversationId) || []),
          user: authMember,
          isTyping: false,
        }, client);
      }, 3000);
    }
  }

  @SubscribeMessage('add_reaction')
  public async handleAddReaction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: MessageReactionPayload,
  ): Promise<void> {
    const authMember = this.clientAuthMap.get(client);
    
    if (!authMember) {
      client.send(JSON.stringify({
        event: 'error',
        message: 'Authentication required to add reactions',
      }));
      return;
    }

    try {
      const reactionInput: MessageReactionInput = {
        messageId: payload.messageId as any,
        emoji: payload.emoji,
      };

      const message = await this.chatService.addMessageReaction(authMember._id, reactionInput);

      // Broadcast reaction to room
      this.broadcastToRoom(client.currentRoom || 'global', {
        event: 'message_reaction',
        message: message,
        user: authMember,
      });

      this.logger.verbose(`Reaction added by ${authMember.memberNick}`);
    } catch (error) {
      this.logger.error(`Error adding reaction: ${error.message}`);
      client.send(JSON.stringify({
        event: 'error',
        message: 'Failed to add reaction',
      }));
    }
  }

  // ==================== LEGACY GLOBAL CHAT ====================

  @SubscribeMessage('message')
  public async handleGlobalMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: string,
  ): Promise<void> {
    const authMember = this.clientAuthMap.get(client);
    
    if (!authMember) {
      client.send(JSON.stringify({
        event: 'error',
        message: 'Authentication required to send messages',
      }));
      return;
    }

    try {
      // Create message in global conversation
      const globalConversation = await this.getOrCreateGlobalConversation();
      
      const messageInput: MessageInput = {
        conversationId: globalConversation._id,
        content: payload,
        messageType: MessageType.TEXT,
      };

      const message = await this.chatService.createMessage(authMember._id, messageInput);

      // Broadcast to global room
      this.broadcastToRoom('global', {
        event: 'global_message',
        message: message,
        sender: authMember,
      });

      this.logger.verbose(`Global message sent by ${authMember.memberNick}: ${payload}`);
    } catch (error) {
      this.logger.error(`Error sending global message: ${error.message}`);
      client.send(JSON.stringify({
        event: 'error',
        message: 'Failed to send message',
      }));
    }
  }

  // ==================== UTILITY METHODS ====================

  private async retrieveMember(req: any): Promise<Member | null> {
    try {
      const parsedUrl = url.parse(req.url, true);
      const { token } = parsedUrl.query;
      
      if (!token) {
        this.logger.verbose('WebSocket connection without token - connecting as guest');
        return null;
      }
      
      return await this.authService.verifyToken(token as string);
    } catch (error) {
      this.logger.warn(`WebSocket JWT verification failed: ${error.message}`);
      return null;
    }
  }


  private async getOrCreateGlobalConversation(): Promise<any> {
    // This would typically fetch or create a global conversation
    // For now, return a mock global conversation ID
    return { _id: 'global' };
  }

  // ==================== PUBLIC METHODS FOR EXTERNAL USE ====================

  public broadcastToUser(userId: string, message: any): void {
    this.clientAuthMap.forEach((member, client) => {
      if (member && member._id.toString() === userId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  public broadcastToRoom(roomId: string, message: any, excludeClient?: AuthenticatedSocket): void {
    const room = this.roomMembers.get(roomId);
    if (!room) return;

    room.forEach((client) => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  public getRoomMembers(roomId: string): Member[] {
    const room = this.roomMembers.get(roomId);
    if (!room) return [];

    return Array.from(room)
      .map(client => this.clientAuthMap.get(client))
      .filter(member => member !== null) as Member[];
  }

  public getTotalConnections(): number {
    return this.total;
  }

  public getActiveRooms(): string[] {
    return Array.from(this.roomMembers.keys());
  }
}
