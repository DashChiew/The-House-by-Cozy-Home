import { createContext, useContext, useState } from 'react';

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const [compared, setCompared] = useState([]); // array of room objects (max 3)

  const addRoom = (room) => {
    setCompared(prev => {
      if (prev.find(r => r.id === room.id)) return prev; // already in
      if (prev.length >= 3) return prev; // max 3
      return [...prev, room];
    });
  };

  const removeRoom = (roomId) => {
    setCompared(prev => prev.filter(r => r.id !== roomId));
  };

  const clearCompare = () => setCompared([]);

  const isInCompare = (roomId) => compared.some(r => r.id === roomId);

  return (
    <CompareContext.Provider value={{ compared, addRoom, removeRoom, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
