import ChatMessage, { IChatMessage } from '../models/ChatMessage';

class ChatService {
    async saveMessage(sender: string, text: string, role: 'STUDENT' | 'TEACHER'): Promise<IChatMessage> {
        const message = new ChatMessage({
            sender,
            text,
            role,
            timestamp: new Date()
        });

        await message.save();
        return message;
    }

    async getRecentMessages(limit: number = 50): Promise<IChatMessage[]> {
        return await ChatMessage.find()
            .sort({ timestamp: -1 })
            .limit(limit)
            .then(messages => messages.reverse()); // Return in chronological order
    }
}

export default new ChatService();
