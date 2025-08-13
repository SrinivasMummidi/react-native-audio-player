import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AutoScrollContextType {
  autoSync: boolean;
  setAutoSync: React.Dispatch<React.SetStateAction<boolean>>;
}

const AutoScrollContext = createContext<AutoScrollContextType | undefined>(
  undefined,
);

interface AutoScrollProviderProps {
  children: ReactNode;
}

export const AutoScrollProvider: React.FC<AutoScrollProviderProps> = ({
  children,
}) => {
  const [autoSync, setAutoSync] = useState(true);

  return (
    <AutoScrollContext.Provider
      value={{ autoSync, setAutoSync }}
    >
      {children}
    </AutoScrollContext.Provider>
  );
};

export const useAutoScroll = (): AutoScrollContextType => {
  const context = useContext(AutoScrollContext);
  if (context === undefined) {
    throw new Error('useAutoScroll must be used within an AutoScrollProvider');
  }
  return context;
};
