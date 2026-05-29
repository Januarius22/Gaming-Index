"use client";

import { createContext, useContext } from "react";

interface AccountShellState {
  sidebarExpanded: boolean;
  sidebarCollapsed: boolean;
}

const AccountShellContext = createContext<AccountShellState | null>(null);

export function AccountShellProvider({
  value,
  children
}: {
  value: AccountShellState;
  children: React.ReactNode;
}) {
  return (
    <AccountShellContext.Provider value={value}>
      {children}
    </AccountShellContext.Provider>
  );
}

export function useAccountShellState() {
  return useContext(AccountShellContext);
}
