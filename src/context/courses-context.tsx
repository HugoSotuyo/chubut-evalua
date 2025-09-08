
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getAllCourses, addCourse as addCourseDb, deleteCourse as deleteCourseDb } from '@/lib/coursesService';
import type { Course } from '@/lib/types';

type NewCourse = Omit<Course, 'id'>;

interface CoursesContextType {
  courses: Course[];
  addCourse: (course: NewCourse) => Promise<{ success: boolean; message: string }>;
  deleteCourse: (courseId: string) => Promise<void>;
  loading: boolean;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCourses = useCallback(async () => {
    setLoading(true);
    try {
        const data = await getAllCourses();
        setCourses(data);
    } catch (error) {
        console.error("Failed to fetch courses:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  const addCourse = async (courseData: NewCourse): Promise<{ success: boolean; message: string }> => {
    const result = await addCourseDb(courseData);
    if (result.success) {
        await refreshCourses();
    }
    return result;
  };

  const deleteCourse = async (courseId: string) => {
    await deleteCourseDb(courseId);
    await refreshCourses();
  };

  return (
    <CoursesContext.Provider value={{ courses, addCourse, deleteCourse, loading }}>
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CoursesContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CoursesProvider');
  }
  return context;
}
