
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

const SCHOOLS_STORAGE_KEY = 'chubut_evalua_schools';
const DISTRICTS_STORAGE_KEY = 'chubut_evalua_districts';

export function SchoolsProvider({ children }: { children: ReactNode }) {
  const [schools, setSchools] = useState<School[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSchools = localStorage.getItem(SCHOOLS_STORAGE_KEY);
      const storedDistricts = localStorage.getItem(DISTRICTS_STORAGE_KEY);

      if (storedSchools) {
        setSchools(JSON.parse(storedSchools));
      } else {
        setSchools(initialSchools);
        localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(initialSchools));
      }

      if (storedDistricts) {
        setDistricts(JSON.parse(storedDistricts));
      } else {
        setDistricts(initialDistricts);
        localStorage.setItem(DISTRICTS_STORAGE_KEY, JSON.stringify(initialDistricts));
      }
    } catch (error) {
      console.error("Failed to access localStorage for schools/districts:", error);
      setSchools(initialSchools);
      setDistricts(initialDistricts);
    }
    setLoading(false);
  }, []);

  const updateSchools = (newSchools: School[]) => {
    setSchools(newSchools);
    try {
        localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(newSchools));
    } catch (error) {
        console.error("Failed to save schools to localStorage:", error);
    }
  };

  const updateDistricts = (newDistricts: string[]) => {
    setDistricts(newDistricts);
    try {
        localStorage.setItem(DISTRICTS_STORAGE_KEY, JSON.stringify(newDistricts));
    } catch (error) {
        console.error("Failed to save districts to localStorage:", error);
    }
  };


  const addSchool = (schoolData: NewSchool) => {
    const newSchool: School = {
        id: (Math.max(0, ...schools.map(s => parseInt(s.id, 10))) + 1).toString(),
        ...schoolData,
        status: "Activa"
    };
    updateSchools([...schools, newSchool]);
  };
  
  const updateSchool = (updatedSchool: School) => {
    const newSchools = schools.map(s => s.id === updatedSchool.id ? updatedSchool : s);
    updateSchools(newSchools);
  };
  
  const deleteSchool = (schoolId: string) => {
    const newSchools = schools.filter(s => s.id !== schoolId);
    updateSchools(newSchools);
  };

  const toggleSchoolStatus = (schoolId: string) => {
    const newSchools = schools.map(s => {
        if (s.id === schoolId) {
            return { ...s, status: s.status === "Activa" ? "Inactiva" : "Activa" };
        }
        return s;
    });
    updateSchools(newSchools);
s
  };
  
  const addDistrict = (districtName: string): { success: boolean; message: string } => {
    if (districts.some(d => d.toLowerCase() === districtName.toLowerCase())) {
        return { success: false, message: `El distrito "${districtName}" ya existe.` };
    }
    updateDistricts([...districts, districtName]);
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
