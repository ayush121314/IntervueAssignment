import { Server, Socket } from 'socket.io';
import chatService from '../services/chat.service';

export const setupChatSocket = (io: Server) => {
    io.on('connection', (socket: Socket) => {

        // Send recent chat history on connection
        socket.on('chat:getHistory', async () => {
            try {
                const messages = await chatService.getRecentMessages(50);
                socket.emit('chat:history', messages);
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        });

        // Handle incoming chat message
        socket.on('chat:message', async (data: { sender: string; text: string; role: 'STUDENT' | 'TEACHER' }) => {
            try {
                const message = await chatService.saveMessage(data.sender, data.text, data.role);

                // Broadcast message to all connected clients
                io.emit('chat:message', {
                    id: message._id,
                    sender: message.sender,
                    text: message.text,
                    role: message.role,
                    timestamp: message.timestamp
                });
            } catch (error) {
                console.error('Error saving chat message:', error);
            }
        });
    });
};
