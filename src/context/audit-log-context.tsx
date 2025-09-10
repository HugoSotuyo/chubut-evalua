
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getAllAuditLogs, addAuditLog as addAuditLogDb } from '@/lib/auditLogService';
import type { AuditLog, AuditAction } from '@/lib/types';
import { useAuth } from './auth-context';

type NewAuditLogPayload = {
    action: AuditAction;
    details: string;
};

interface AuditLogContextType {
  auditLogs: AuditLog[];
  addAuditLog: (payload: NewAuditLogPayload) => Promise<void>;
  loading: boolean;
}

const AuditLogContext = createContext<AuditLogContextType | undefined>(undefined);

export function AuditLogProvider({ children }: { children: ReactNode }) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
        const data = await getAllAuditLogs();
        setAuditLogs(data);
    } catch (error) {
        console.error("Failed to fetch audit logs:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuditLogs();
  }, [refreshAuditLogs]);

  const addAuditLog = async (payload: NewAuditLogPayload) => {
    if (!user) {
        console.warn("Attempted to add audit log without a logged-in user.");
        return;
    }
    
    const logEntry = {
        user: user.email,
        action: payload.action,
        details: payload.details,
        timestamp: new Date().toISOString(),
    };

    try {
        await addAuditLogDb(logEntry);
        // We can optionally refresh logs here, or just append to the current state
        // for better performance if many logs are added in a short time.
        // For simplicity and to ensure data consistency, we'll refresh.
        await refreshAuditLogs();
    } catch (error) {
        console.error("Failed to add audit log:", error);
    }
  };

  const value = { auditLogs, addAuditLog, loading };

  return (
    <AuditLogContext.Provider value={value}>
      {children}
    </AuditLogContext.Provider>
  );
}

export function useAuditLogs() {
  const context = useContext(AuditLogContext);
  if (context === undefined) {
    throw new Error('useAuditLogs must be used within an AuditLogProvider');
  }
  return context;
}
