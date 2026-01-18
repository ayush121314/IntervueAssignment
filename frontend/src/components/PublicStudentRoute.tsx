import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { usePollContext } from '../context/PollContext';
import apiService from '../services/api';

interface PublicStudentRouteProps {
    children: React.ReactNode;
}

const PublicStudentRoute: React.FC<PublicStudentRouteProps> = ({ children }) => {
    const { studentInfo } = usePollContext();
    const [loading, setLoading] = useState(true);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        const checkExistingSession = async () => {
            if (studentInfo?.id) {
                try {
                    // Check if the session is actually valid/kicked on backend
                    const response = await apiService.validateStudentSession(studentInfo.id);
                    if (response.valid || response.isKicked) {
                        // If Valid OR Kicked, you belong on the Poll page.
                        // You cannot join again.
                        setShouldRedirect(true);
                    }
                    // If 404/Invalid, we allow you to stay on Join page (and creating new user will overwrite)
                } catch (error) {
                    console.error('Public route session check failed', error);
                }
            }
            setLoading(false);
        };

        checkExistingSession();
    }, [studentInfo]);

    if (loading) {
        return <div className="centered-view">Loading...</div>;
    }

    if (shouldRedirect) {
        return <Navigate to="/student/poll" replace />;
    }

    return <>{children}</>;
};

export default PublicStudentRoute;
