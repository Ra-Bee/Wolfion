import { useState, useEffect } from 'react';

export type Role = 'customer' | 'admin' | null;

export function useRole() {
  const [role, setRoleState] = useState<Role>(() => {
    try {
      const stored = localStorage.getItem('wolfion_role');
      return (stored as Role) || null;
    } catch {
      return null;
    }
  });

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem('wolfion_role', newRole);
    } else {
      localStorage.removeItem('wolfion_role');
    }
  };

  return { role, setRole };
}
