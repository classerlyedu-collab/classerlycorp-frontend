import React, { useState, createContext, useContext } from 'react';

interface StateContextProps {
    showSideBar: boolean;
    setShowSideBar: any;
    loading: boolean;
    setLoading: any;
    role: 'Supervisor' | 'Employee' | 'HR-Admin' | null;
    setRole: any;
    hasChanges: boolean;
    setHasChanges: any;
    isModalOpen: boolean;
    setIsModalOpen: any;
    user: any;
    setUser: any;
    updateUser: (userData: any) => void;
    dashboardRefreshTrigger: number;
    setDashboardRefreshTrigger: (value: number | ((prev: number) => number)) => void;
    subscriptionAllowed: boolean;
    setSubscriptionAllowed: (allowed: boolean) => void;
}

const StateContext = createContext<StateContextProps | undefined>(undefined);

export const ContextProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    // global
    const [showSideBar, setShowSideBar] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);

    // Initialize user from localStorage
    const getUserFromStorage = () => {
        try {
            const userData = localStorage.getItem("user");
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing user from localStorage:', error);
            return null;
        }
    };

    const [user, setUser] = useState<any>(getUserFromStorage());
    const [role, setRole] = useState<'Supervisor' | 'Employee' | 'HR-Admin' | null>(user?.userType || null);
    const [subscriptionAllowed, setSubscriptionAllowed] = useState<boolean>(false); // Default to false - secure by default

    // Function to update user data
    const updateUser = (userData: any) => {
        setUser(userData);
        setRole(userData?.userType || null);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    // Debug logging for role detection
    console.log('ContextProvider: Role detection', {
        userFromStorage: user,
        userType: user?.userType,
        role: role
    });

    return (
        <StateContext.Provider value={{
            showSideBar,
            setShowSideBar,
            loading,
            setLoading,
            role,
            setRole,
            hasChanges,
            setHasChanges,
            isModalOpen,
            setIsModalOpen,
            user,
            setUser,
            updateUser,
            dashboardRefreshTrigger,
            setDashboardRefreshTrigger,
            subscriptionAllowed,
            setSubscriptionAllowed
        }} >
            {props.children}
        </StateContext.Provider>
    )

};

export const UseStateContext = () => {
    const context = useContext(StateContext);

    if (!context) {
        console.log('useContext must be used within a StateContextProvider');
    }

    return context as StateContextProps;
};