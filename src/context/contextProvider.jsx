import { createContext, useContext, useState, useEffect } from 'react';

// Create Context
const StateContext = createContext({
    user: null,
    token: null,
    setUser: () => {},
    setToken: () => {},
});

// Context Provider Component
export const ContextProvider = ({ children }) => {
    const [user, _setUser] = useState(() => {
        // Try to load user from localStorage
        const storedUser = localStorage.getItem('USER_DATA');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, _setToken] = useState(() => localStorage.getItem('ACCESS_TOKEN'));

    const setToken = (token_prop) => {
        _setToken(token_prop);
        if (token_prop) {
            localStorage.setItem('ACCESS_TOKEN', token_prop);
        } else {
            localStorage.removeItem('ACCESS_TOKEN');
        }
    };

    const setUser = (userData) => {
        _setUser(userData);
        if (userData) {
            localStorage.setItem('USER_DATA', JSON.stringify(userData));
        } else {
            localStorage.removeItem('USER_DATA');
        }
    };

    return (
        <StateContext.Provider value={{ user, token, setUser, setToken }}>
            {children}
        </StateContext.Provider>
    );
};

// Custom hook to use the state context
export const useStateContext = () => useContext(StateContext);
