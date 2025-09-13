

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { 
    getAllSchools, 
    addSchool as addSchoolDb, 
    updateSchool as updateSchoolDb, 
    deleteSchool as deleteSchoolDb, 
    toggleSchoolStatus as toggleSchoolStatusDb, 
    getAllRegions, 
    addRegion as addRegionDb,
    deleteRegion as deleteRegionDb
} from '@/lib/schoolsService';
import type { School, Region } from '@/lib/types';
import { useAuditLogs } from './audit-log-context';

type NewSchool = Omit<School, 'id' | 'status' | 'regionId'>;

interface SchoolsContextType {
  schools: School[];
  regions: Region[];
  addSchool: (school: NewSchool, regionId: string) => Promise<void>;
  updateSchool: (school: School) => Promise<void>;
  deleteSchool: (schoolId: string) => Promise<void>;
  toggleSchoolStatus: (schoolId: string) => Promise<void>;
  addRegion: (regionName: string) => Promise<{ success: boolean; message: string }>;
  deleteRegion: (regionId: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
}

const SchoolsContext = createContext<SchoolsContextType | undefined>(undefined);

export function SchoolsProvider({ children }: { children: ReactNode }) {
  const [schools, setSchools] = useState<School[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const { addAuditLog } = useAuditLogs();

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
        const [schoolsData, regionsData] = await Promise.all([
            getAllSchools(),
            getAllRegions()
        ]);
        setSchools(schoolsData);
        setRegions(regionsData);
    } catch (error) {
        console.error("Failed to fetch schools/regions:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addSchool = async (schoolData: NewSchool, regionId: string) => {
    await addSchoolDb(schoolData, regionId);
    await addAuditLog({ action: "CREAR_ESCUELA", details: `Se creó la escuela "${schoolData.name}"` });
    await refreshData();
  };
  
  const updateSchool = async (updatedSchool: School) => {
    await updateSchoolDb(updatedSchool);
    await addAuditLog({ action: "EDITAR_ESCUELA", details: `Se editó la escuela "${updatedSchool.name}"` });
    await refreshData();
  };
  
  const deleteSchool = async (schoolId: string) => {
    const schoolToDelete = schools.find(s => s.id === schoolId);
    await deleteSchoolDb(schoolId);
    if(schoolToDelete) {
        await addAuditLog({ action: "ELIMINAR_ESCUELA", details: `Se eliminó la escuela "${schoolToDelete.name}"` });
    }
    await refreshData();
  };

  const toggleSchoolStatus = async (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    await toggleSchoolStatusDb(schoolId);
    if(school) {
        const newStatus = school.status === "Activa" ? "Inactiva" : "Activa";
        await addAuditLog({ action: "CAMBIAR_ESTADO_ESCUELA", details: `Se cambió el estado de la escuela "${school.name}" a ${newStatus}` });
    }
    await refreshData();
  };
  
  const addRegion = async (regionName: string): Promise<{ success: boolean; message: string }> => {
    const result = await addRegionDb(regionName);
    if (result.success) {
      await addAuditLog({ action: "CREAR_REGION", details: `Se creó la región "${regionName}"` });
      await refreshData();
    }
    return result;
  };

  const deleteRegion = async (regionId: string): Promise<{ success: boolean; message: string }> => {
    const regionToDelete = regions.find(d => d.id === regionId);
    const result = await deleteRegionDb(regionId);
    if (result.success && regionToDelete) {
      await addAuditLog({ action: "ELIMINAR_REGION", details: `Se eliminó la región "${regionToDelete.name}"` });
      await refreshData();
    }
    return result;
  };

  const value = { 
    schools, 
    regions,
    addSchool, 
    updateSchool, 
    deleteSchool, 
    toggleSchoolStatus,
    addRegion,
    deleteRegion,
    loading 
  };

  return (
    <SchoolsContext.Provider value={value}>
      {children}
    </SchoolsContext.Provider>
  );
}

export function useSchools() {
  const context = useContext(SchoolsContext);
  if (context === undefined) {
    throw new Error('useSchools must be used within a SchoolsProvider');
  }
  return context;
}
