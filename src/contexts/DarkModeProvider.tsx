import React, {
    createContext, useContext, ReactNode, useState, useEffect, useMemo,
  } from 'react';
  
  interface DarkModeState {
    darkMode: boolean;
  }
  
  interface DarkModeContextProps {
    darkModeState: DarkModeState;
    toggleDarkMode: () => void;
  }
  
  const DarkModeContext = createContext<DarkModeContextProps | undefined>(undefined);
  
  interface DarkModeProviderProps {
    children: ReactNode;
  }
  
  // Dark Mode Provider component
  export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
    const [darkModeState, setDarkModeState] = useState<DarkModeState>({ darkMode: true });
  
    useEffect(() => {
      const { darkMode } = darkModeState;
    //   if (darkMode) {
    //     document.documentElement.classList.add('dark');
    //     localStorage.setItem('darkMode', 'true');
    //   } else {
    //     document.documentElement.classList.remove('dark');
    //     localStorage.setItem('darkMode', 'false');
    //   }
    }, [darkModeState]);
  
    const toggleDarkMode = () => setDarkModeState((prevState) => {
      const newDarkModeState = !prevState.darkMode;
      return { darkMode: newDarkModeState };
    });
  
    const value = useMemo(() => ({
      darkModeState,
      toggleDarkMode,
    }), [darkModeState]);
  
    return (
      <DarkModeContext.Provider value={value}>
        {children}
      </DarkModeContext.Provider>
    );
  };
  
  // Custom hook to use the dark mode context
  export const useDarkMode = () => {
    const context = useContext(DarkModeContext);
    if (!context) {
      throw new Error('useDarkMode must be used within a DarkModeProvider');
    }
    return context;
  };