import { useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { loadStudentRecords, saveStudentRecords } from '../store/storage';
import type { StudentRecord } from '../types';

export function useStudentRecords() {
  const [records, setRecords] = useState<StudentRecord[]>(loadStudentRecords);

  const persist = useCallback((updated: StudentRecord[]) => {
    setRecords(updated);
    saveStudentRecords(updated);
  }, []);

  const addRecord = useCallback((studentId: string, date: string, amount: number) => {
    const record: StudentRecord = { id: uuid(), studentId, date, amount };
    persist([...records, record]);
  }, [records, persist]);

  const deleteRecord = useCallback((id: string) => {
    persist(records.filter(r => r.id !== id));
  }, [records, persist]);

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  return { records, setRecords, addRecord, deleteRecord, clearAll };
}
