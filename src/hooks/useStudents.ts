import { useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { loadStudents, saveStudents } from '../store/storage';
import type { Student } from '../types';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>(loadStudents);

  const persist = useCallback((updated: Student[]) => {
    setStudents(updated);
    saveStudents(updated);
  }, []);

  const addStudent = useCallback((name: string) => {
    const student: Student = { id: uuid(), name, createdAt: new Date().toISOString() };
    persist([...students, student]);
    return student.id;
  }, [students, persist]);

  const deleteStudent = useCallback((id: string) => {
    persist(students.filter(s => s.id !== id));
  }, [students, persist]);

  return { students, setStudents, addStudent, deleteStudent };
}
