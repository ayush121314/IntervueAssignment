import { Server, Socket } from 'socket.io';
import pollService from '../services/poll.service';
import voteService from '../services/vote.service';
import studentService from '../services/student.service';
import timerService from '../services/timer.service';

export const setupPollSocket = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('✅ Client connected:', socket.id);

        // Student joins
        socket.on('student:join', async (data: { studentId: string; name: string }) => {
            try {
                // Ensure student is registered/updated with current socket ID
                const student = await studentService.registerStudent(data.studentId, data.name, socket.id);

                // Broadcast updated participants list to all clients
                const activeStudents = await studentService.getActiveStudents();
                io.emit('participants:update', activeStudents.map(s => ({
                    id: s.studentId,
                    name: s.name,
                    joinedAt: s.joinedAt
                })));

                console.log(`Student joined: ${data.name} (${data.studentId}) with socket ${socket.id}`);
            } catch (error: any) {
                console.error('Error registering student:', error);

                // If student is kicked, inform them immediately
                if (error.message.includes('kicked')) {
                    socket.emit('student:kicked', {
                        message: 'You have been removed from the poll and cannot rejoin.'
                    });
                }
            }
        });

        // Vote submitted (emit real-time update)
        socket.on('vote:submit', async (data: { pollId: string; studentId: string; optionId: string }) => {
            try {
                await voteService.submitVote(data.pollId, data.studentId, data.optionId);

                // Get updated poll results
                const pollState = await pollService.getCurrentPoll();

                // Emit vote accepted to the student
                socket.emit('vote:accepted', {
                    pollId: data.pollId,
                    optionId: data.optionId
                });

                // Emit updated results to all clients (especially teacher)
                io.emit('poll:update', pollState);

            } catch (error: any) {
                // Emit vote rejected to the student
                socket.emit('vote:rejected', {
                    error: error.message
                });
            }
        });

        // Teacher kicks a student
        socket.on('student:kick', async (data: { studentId: string }) => {
            try {
                const student = await studentService.getStudentById(data.studentId);

                if (student) {
                    await studentService.kickStudent(data.studentId);

                    // Emit kick event to the specific student
                    io.to(student.socketId).emit('student:kicked', {
                        message: 'You have been removed from the poll'
                    });

                    // Broadcast updated participants list
                    const activeStudents = await studentService.getActiveStudents();
                    io.emit('participants:update', activeStudents.map(s => ({
                        id: s.studentId,
                        name: s.name,
                        joinedAt: s.joinedAt
                    })));
                }
            } catch (error) {
                console.error('Error kicking student:', error);
            }
        });

        // Poll started (broadcast to all)
        socket.on('poll:start', async (pollData: any) => {
            // Add server time for synchronization
            const dataWithServerTime = {
                ...pollData,
                serverTime: new Date().toISOString()
            };
            io.emit('poll:start', dataWithServerTime);
            console.log(`Poll started: ${pollData.pollId}`);
        });

        // Poll ended manually by teacher
        socket.on('poll:end', async (data: { pollId: string }) => {
            try {
                await timerService.endPoll(data.pollId);
            } catch (error) {
                console.error('Error ending poll manually:', error);
            }
        });

        // Disconnect
        socket.on('disconnect', async () => {
            console.log('❌ Client disconnected:', socket.id);

            // Mark student as inactive
            await studentService.deactivateStudent(socket.id);

            // Broadcast updated participants list
            const activeStudents = await studentService.getActiveStudents();
            io.emit('participants:update', activeStudents.map(s => ({
                id: s.studentId,
                name: s.name,
                joinedAt: s.joinedAt
            })));
        });
    });
};
