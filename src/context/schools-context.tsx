
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type School = {
  id: string;
  name: string;
  district: string;
  status: "Activa" | "Inactiva";
};

type District = {
    id: string;
    name: string;
}

type NewSchool = Omit<School, 'id' | 'status'>;

interface SchoolsContextType {
  schools: School[];
  districts: string[];
  addSchool: (school: NewSchool) => Promise<void>;
  updateSchool: (school: School) => Promise<void>;
  deleteSchool: (schoolId: string) => Promise<void>;
  toggleSchoolStatus: (schoolId: string) => Promise<void>;
  addDistrict: (districtName: string) => Promise<void>;
  loading: boolean;
}

const SchoolsContext = createContext<SchoolsContextType | undefined>(undefined);

export function SchoolsProvider({ children }: { children: ReactNode }) {
  const [schools, setSchools] = useState<School[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchoolsAndDistricts = async () => {
    setLoading(true);
    try {
      // Fetch schools
      const schoolsQuery = query(collection(db, 'schools'), orderBy("name"));
      const schoolsSnapshot = await getDocs(schoolsQuery);
      const schoolsList = schoolsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
      setSchools(schoolsList);

      // Fetch districts
      const districtsQuery = query(collection(db, 'districts'), orderBy("name"));
      const districtsSnapshot = await getDocs(districtsQuery);
      const districtsList = districtsSnapshot.docs.map(doc => (doc.data() as { name: string }).name);
      setDistricts(districtsList);

    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolsAndDistricts();
  }, []);

  const addSchool = async (schoolData: NewSchool) => {
    try {
      const newSchool = {
          ...schoolData,
          status: "Activa"
      }
      await addDoc(collection(db, 'schools'), newSchool);
      await fetchSchoolsAndDistricts(); 
    } catch (error) {
      console.error("Error adding school:", error);
    }
  };
  
  const updateSchool = async (updatedSchool: School) => {
    try {
        const schoolDocRef = doc(db, 'schools', updatedSchool.id);
        const { id, ...dataToUpdate } = updatedSchool;
        await updateDoc(schoolDocRef, dataToUpdate);
        await fetchSchoolsAndDistricts();
    } catch(error) {
        console.error("Error updating school:", error);
    }
  };
  
  const deleteSchool = async (schoolId: string) => {
    try {
        await deleteDoc(doc(db, 'schools', schoolId));
        await fetchSchoolsAndDistricts();
    } catch (error) {
        console.error("Error deleting school:", error);
    }
  };

  const toggleSchoolStatus = async (schoolId: string) => {
    const schoolToToggle = schools.find(s => s.id === schoolId);
    if (!schoolToToggle) return;
    
    try {
        const newStatus = schoolToToggle.status === "Activa" ? "Inactiva" : "Activa";
        const schoolDocRef = doc(db, 'schools', schoolId);
        await updateDoc(schoolDocRef, { status: newStatus });
        await fetchSchoolsAndDistricts();
    } catch (error) {
        console.error("Error toggling school status:", error);
    }
  };
  
  const addDistrict = async (districtName: string) => {
    // Basic check to prevent adding empty district names
    if (!districtName.trim()) {
        console.error("District name cannot be empty.");
        return;
    }
    try {
        await addDoc(collection(db, 'districts'), { name: districtName });
        await fetchSchoolsAndDistricts(); // Reload all data after adding
    } catch(error) {
        console.error("Error adding district:", error);
        // Optionally re-throw or handle the error for the UI
        throw error;
    }
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
