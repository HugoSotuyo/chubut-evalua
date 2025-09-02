
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

// En un futuro, estos datos vendrían de Firestore
const initialSchoolsData = [
    { id: "esc-001", name: "Escuela N° 101", district: "Distrito I", status: "Activa" },
    { id: "esc-002", name: "Escuela N° 789", district: "Distrito II", status: "Activa" },
    { id: "esc-003", name: "Escuela N° 456", district: "Distrito I", status: "Activa" },
    { id: "esc-004", name: "Escuela N° 23", district: "Distrito III", status: "Inactiva" },
    { id: "esc-005", name: "Escuela N° 502", district: "Distrito II", status: "Activa" },
];

const initialDistrictsData = ["Distrito I", "Distrito II", "Distrito III", "Distrito IV", "Distrito V"];

export type School = {
  id: string;
  name: string;
  district: string;
  status: "Activa" | "Inactiva";
};

type NewSchool = Omit<School, 'id' | 'status'>;

interface SchoolsContextType {
  schools: School[];
  districts: string[];
  addSchool: (school: NewSchool) => void;
  updateSchool: (school: School) => void;
  deleteSchool: (schoolId: string) => void;
  toggleSchoolStatus: (schoolId: string) => void;
  addDistrict: (districtName: string) => void;
  loading: boolean;
}

const SchoolsContext = createContext<SchoolsContextType | undefined>(undefined);

export function SchoolsProvider({ children }: { children: ReactNode }) {
  const [schools, setSchools] = useState<School[]>(initialSchoolsData);
  const [districts, setDistricts] = useState<string[]>(initialDistrictsData);
  const [loading, setLoading] = useState(false); // Por ahora en false, cambiaría con Firestore

  const uniqueDistricts = useMemo(() => {
    const districtsFromSchools = schools.map(school => school.district);
    return [...new Set([...districtsFromSchools, ...districts])];
  }, [schools, districts]);

  const addSchool = (schoolData: NewSchool) => {
    const newSchool: School = {
        ...schoolData,
        id: `esc-${Date.now()}`,
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
    setSchools(prev => prev.map(s => 
        s.id === schoolId 
            ? { ...s, status: s.status === "Activa" ? "Inactiva" : "Activa" } 
            : s
    ));
  };
  
  const addDistrict = (districtName: string) => {
    if (!districts.includes(districtName)) {
        setDistricts(prev => [...prev, districtName]);
    }
  };

  const value = { 
    schools, 
    districts: uniqueDistricts, 
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
