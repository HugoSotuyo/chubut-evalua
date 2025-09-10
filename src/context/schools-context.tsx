

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { 
    getAllSchools, 
    addSchool as addSchoolDb, 
    updateSchool as updateSchoolDb, 
    deleteSchool as deleteSchoolDb, 
    toggleSchoolStatus as toggleSchoolStatusDb, 
    getAllDistricts, 
    addDistrict as addDistrictDb,
    deleteDistrict as deleteDistrictDb
} from '@/lib/schoolsService';
import type { School, District } from '@/lib/types';
import { useAuditLogs } from './audit-log-context';

type NewSchool = Omit<School, 'id' | 'status' | 'districtId'>;

interface SchoolsContextType {
  schools: School[];
  districts: District[];
  addSchool: (school: NewSchool, districtId: string) => Promise<void>;
  updateSchool: (school: School) => Promise<void>;
  deleteSchool: (schoolId: string) => Promise<void>;
  toggleSchoolStatus: (schoolId: string) => Promise<void>;
  addDistrict: (districtName: string) => Promise<{ success: boolean; message: string }>;
  deleteDistrict: (districtId: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
}

const SchoolsContext = createContext<SchoolsContextType | undefined>(undefined);

export function SchoolsProvider({ children }: { children: ReactNode }) {
  const [schools, setSchools] = useState<School[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const { addAuditLog } = useAuditLogs();

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
        const [schoolsData, districtsData] = await Promise.all([
            getAllSchools(),
            getAllDistricts()
        ]);
        setSchools(schoolsData);
        setDistricts(districtsData);
    } catch (error) {
        console.error("Failed to fetch schools/districts:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addSchool = async (schoolData: NewSchool, districtId: string) => {
    await addSchoolDb(schoolData, districtId);
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
  
  const addDistrict = async (districtName: string): Promise<{ success: boolean; message: string }> => {
    const result = await addDistrictDb(districtName);
    if (result.success) {
      await addAuditLog({ action: "CREAR_DISTRITO", details: `Se creó el distrito "${districtName}"` });
      await refreshData();
    }
    return result;
  };

  const deleteDistrict = async (districtId: string): Promise<{ success: boolean; message: string }> => {
    const districtToDelete = districts.find(d => d.id === districtId);
    const result = await deleteDistrictDb(districtId);
    if (result.success && districtToDelete) {
      await addAuditLog({ action: "ELIMINAR_DISTRITO", details: `Se eliminó el distrito "${districtToDelete.name}"` });
      await refreshData();
    }
    return result;
  };

  const value = { 
    schools, 
    districts,
    addSchool, 
    updateSchool, 
    deleteSchool, 
    toggleSchoolStatus,
    addDistrict,
    deleteDistrict,
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
