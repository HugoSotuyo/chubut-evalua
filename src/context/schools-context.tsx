
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getAllSchools, addSchool as addSchoolDb, updateSchool as updateSchoolDb, deleteSchool as deleteSchoolDb, toggleSchoolStatus as toggleSchoolStatusDb, getAllDistricts, addDistrict as addDistrictDb } from '@/lib/schoolsService';
import type { School } from '@/lib/types';

type NewSchool = Omit<School, 'id' | 'status'>;

interface SchoolsContextType {
  schools: School[];
  districts: string[];
  addSchool: (school: NewSchool) => Promise<void>;
  updateSchool: (school: School) => Promise<void>;
  deleteSchool: (schoolId: string) => Promise<void>;
  toggleSchoolStatus: (schoolId: string) => Promise<void>;
  addDistrict: (districtName: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
}

const SchoolsContext = createContext<SchoolsContextType | undefined>(undefined);

export function SchoolsProvider({ children }: { children: ReactNode }) {
  const [schools, setSchools] = useState<School[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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

  const addSchool = async (schoolData: NewSchool) => {
    await addSchoolDb(schoolData);
    await refreshData();
  };
  
  const updateSchool = async (updatedSchool: School) => {
    await updateSchoolDb(updatedSchool);
    await refreshData();
  };
  
  const deleteSchool = async (schoolId: string) => {
    await deleteSchoolDb(schoolId);
    await refreshData();
  };

  const toggleSchoolStatus = async (schoolId: string) => {
    await toggleSchoolStatusDb(schoolId);
    await refreshData();
  };
  
  const addDistrict = async (districtName: string): Promise<{ success: boolean; message: string }> => {
    const result = await addDistrictDb(districtName);
    if (result.success) {
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
