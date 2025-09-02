
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type School = {
  id: string;
  name: string;
  district: string;
  status: "Activa" | "Inactiva";
};

type NewSchool = Omit<School, 'id' | 'status'>;

const initialSchools: School[] = [
    { id: "1", name: "Escuela N° 123", district: "Distrito I", status: "Activa" },
    { id: "2", name: "Escuela N° 456", district: "Distrito II", status: "Activa" },
    { id: "3", name: "Escuela N° 789", district: "Distrito I", status: "Inactiva" },
];

const initialDistricts: string[] = ["Distrito I", "Distrito II", "Distrito III"];

interface SchoolsContextType {
  schools: School[];
  districts: string[];
  addSchool: (school: NewSchool) => void;
  updateSchool: (school: School) => void;
  deleteSchool: (schoolId: string) => void;
  toggleSchoolStatus: (schoolId: string) => void;
  addDistrict: (districtName: string) => { success: boolean; message: string };
  loading: boolean;
}

const SchoolsContext = createContext<SchoolsContextType | undefined>(undefined);

export function SchoolsProvider({ children }: { children: ReactNode }) {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [districts, setDistricts] = useState<string[]>(initialDistricts);
  const [loading] = useState(false);

  const addSchool = (schoolData: NewSchool) => {
    const newSchool: School = {
        id: (schools.length + 1).toString(),
        ...schoolData,
        status: "Activa"
    };
    setSchools(prev => [...prev, newSchool]);
  };
  
  const updateSchool = (updatedSchool: School) => {
    setSchools(prev => prev.map(s => s.id === updatedSchool.id ? updatedSchool : s));
  };
  
  const deleteSchool = (schoolId: string) => {
    setSchools(prev => prev.filter(s => s.id !== schoolId));
  };

  const toggleSchoolStatus = (schoolId: string) => {
    setSchools(prev => prev.map(s => {
        if (s.id === schoolId) {
            return { ...s, status: s.status === "Activa" ? "Inactiva" : "Activa" };
        }
        return s;
    }));
  };
  
  const addDistrict = (districtName: string): { success: boolean; message: string } => {
    if (districts.some(d => d.toLowerCase() === districtName.toLowerCase())) {
        return { success: false, message: `El distrito "${districtName}" ya existe.` };
    }
    setDistricts(prev => [...prev, districtName]);
    return { success: true, message: `El distrito "${districtName}" ha sido agregado.` };
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
