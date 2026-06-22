import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { StudentView, parseStudentParam } from './components/StudentView.tsx'

const studentData = parseStudentParam();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {studentData ? <StudentView data={studentData} /> : <App />}
  </StrictMode>,
)
