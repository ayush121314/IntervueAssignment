import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface Student {
    id: string;
    name: string;
    joinedAt?: Date;
}

interface PollContextType {
    studentInfo: Student | null;
    setStudentInfo: (student: Student | null) => void;
    hasVoted: boolean;
    setHasVoted: (voted: boolean) => void;
    votedOptionId: string | null;
    setVotedOptionId: (optionId: string | null) => void;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export const PollProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [studentInfo, setStudentInfo] = useState<Student | null>(() => {
        // Try to restore from sessionStorage
        const stored = sessionStorage.getItem('studentInfo');
        return stored ? JSON.parse(stored) : null;
    });

    const [hasVoted, setHasVoted] = useState(false);
    const [votedOptionId, setVotedOptionId] = useState<string | null>(null);

    const updateStudentInfo = (student: Student | null) => {
        setStudentInfo(student);
        if (student) {
            sessionStorage.setItem('studentInfo', JSON.stringify(student));
        } else {
            sessionStorage.removeItem('studentInfo');
        }
    };

    return (
        <PollContext.Provider
            value={{
                studentInfo,
                setStudentInfo: updateStudentInfo,
                hasVoted,
                setHasVoted,
                votedOptionId,
                setVotedOptionId
            }}
        >
            {children}
        </PollContext.Provider>
    );
};

export const usePollContext = () => {
    const context = useContext(PollContext);
    if (!context) {
        throw new Error('usePollContext must be used within PollProvider');
    }
    return context;
};
