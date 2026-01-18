import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePollContext } from '../context/PollContext';
import apiService from '../services/api';

interface ProtectedStudentRouteProps {
    children: React.ReactNode;
}

const ProtectedStudentRoute: React.FC<ProtectedStudentRouteProps> = ({ children }) => {
    const { studentInfo, setStudentInfo } = usePollContext();
    const [loading, setLoading] = useState(true);
    const [isKicked, setIsKicked] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const verifySession = async () => {
            if (!studentInfo?.id) {
                setLoading(false);
                return;
            }

            try {
                const response = await apiService.validateStudentSession(studentInfo.id);

                if (response.isKicked) {
                    setIsKicked(true);
                } else if (!response.valid) {
                    // Invalid session (404), clear it
                    setStudentInfo(null);
                }
                // If valid, just finish loading
            } catch (error) {
                console.error('Session check failed:', error);
                // On server error, maybe don't clear? But for safety/simplicity we might treating as invalid or retry?
                // For now, if verification fails (network), we might want to block access or let it slide (safe fail).
                // Let's assume strict: if we can't verify, we don't let in.
                setStudentInfo(null);
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, [studentInfo, setStudentInfo]);

    if (loading) {
        return <div className="centered-view">Loading...</div>; // Or a spinner component
    }

    if (!studentInfo) {
        // No session -> Redirect to Join
        return <Navigate to="/student/join" state={{ from: location }} replace />;
    }

    if (isKicked) {
        // If kicked, we DO render the child because the child (StudentPoll) handles the "Kicked UI" 
        // OR we could render a generic Kicked component here. 
        // Since StudentPoll has specific UI for it, we can pass a state or context, 
        // BUT StudentPoll checks isKicked itself too. 
        // To be "Strict", we should probably force the "Kicked" state.
        // Let's navigate to poll with state if we aren't there, or render children.
        // Actually, cleaner: Render children, but ensure children know it's kicked.
        // Better yet: Pass `initialKicked` state to children via cloneElement? No.
        // We will rely on StudentPoll's internal check OR pass state via Navigate if we weren't here.
        // Since we are wrapping Poll, we just render it. The Poll component's own API check (or the passed prop if we added one) would show the UI.
        // BUT wait, if we are Kicked, we want to stay on /student/poll.
        return <>{children}</>;
    }

    return <>{children}</>;
};

export default ProtectedStudentRoute;
