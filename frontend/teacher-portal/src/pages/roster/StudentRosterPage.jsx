import React, { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { CheckIcon, XIcon, PlusIcon, UploadIcon, EditIcon, TrashIcon } from '../../components/common/Icons';
import './StudentRosterPage.css';

// ---------------------------------------------------------------------------
// Mock data – a list of registered students
// ---------------------------------------------------------------------------
const initialStudents = [
  {
    id: 's1',
    name: 'Alice Johnson',
    roll: 'CS2021001',
    department: 'Computer Science',
    semester: '4',
    batch: '2021',
    email: 'alice.johnson@example.com',
    participation: [
      { exam: 'Midterm Chemistry', date: '2023-03-12', status: 'Submitted' },
      { exam: 'Final Physics', date: '2023-05-08', status: 'Submitted' },
    ],
  },
  {
    id: 's2',
    name: 'Bob Smith',
    roll: 'ME2021005',
    department: 'Mechanical Engineering',
    semester: '6',
    batch: '2020',
    email: 'bob.smith@example.com',
    participation: [
      { exam: 'Thermodynamics', date: '2023-02-20', status: 'Absent' },
    ],
  },
];

// Helper for CSV parsing – very simple, assumes header row matches fields above
const parseCSV = (text) => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const records = lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const rec = {};
    header.forEach((h, i) => {
      rec[h] = cols[i] ?? '';
    });
    // generate a simple id if not provided
    rec.id = rec.id || `s${Date.now()}${Math.random().toString(36).substr(2, 4)}`;
    // initialise optional arrays
    rec.participation = [];
    return rec;
  });
  return records;
};

export const StudentRosterPage = () => {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department: '', semester: '', batch: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newStudent, setNewStudent] = useState({ name: '', roll: '', department: '', semester: '', batch: '', email: '' });
  const [editVals, setEditVals] = useState({ name: '', roll: '', department: '', semester: '', batch: '', email: '' });

  // Populate edit fields when a student is selected for editing
  useEffect(() => {
    if (editId) {
      const student = students.find((s) => s.id === editId);
      if (student) {
        setEditVals({
          name: student.name,
          roll: student.roll,
          department: student.department,
          semester: student.semester,
          batch: student.batch,
          email: student.email,
        });
      }
    }
  }, [editId, students]);




  // -----------------------------------------------------------------------
  // CRUD helpers (all operate on the mock array)
  // -----------------------------------------------------------------------
  const addStudent = () => {
    const id = `s${Date.now()}`;
    setStudents((prev) => [...prev, { ...newStudent, id, participation: [] }]);
    setNewStudent({ name: '', roll: '', department: '', semester: '', batch: '', email: '' });
    setShowAdd(false);
  };

  const updateStudent = (id, updates) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    setEditId(null);
  };

  const deleteStudent = (id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const importCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const records = parseCSV(text);
    setStudents((prev) => [...prev, ...records]);
    e.target.value = null;
  };

  // -----------------------------------------------------------------------
  // UI helpers
  // -----------------------------------------------------------------------
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filters.department ? s.department === filters.department : true;
    const matchesSem = filters.semester ? s.semester === filters.semester : true;
    const matchesBatch = filters.batch ? s.batch === filters.batch : true;
    return matchesSearch && matchesDept && matchesSem && matchesBatch;
  });

  const departments = [...new Set(students.map((s) => s.department))];
  const semesters = [...new Set(students.map((s) => s.semester))];
  const batches = [...new Set(students.map((s) => s.batch))];

  return (
    <div className="roster-page">
      <h2 className="page-title">Student Roster</h2>

      <div className="toolbar">
        <Input label="Search" type="text" placeholder="Name or Roll No." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select label="Department" options={[{value:'',label:''},...departments.map(d=>({value:d,label:d}))]} value={filters.department} onChange={(v)=> setFilters((f) => ({ ...f, department: v }))} />
        <Select label="Semester" options={['', ...semesters].map(s=>({value:s,label:s}))} value={filters.semester} onChange={(v) => setFilters((f) => ({ ...f, semester: v }))} />
        <Select label="Batch" options={['', ...batches].map(b=>({value:b,label:b}))} value={filters.batch} onChange={(v) => setFilters((f) => ({ ...f, batch: v }))} />
        <label className="file-upload">
          <UploadIcon /> Import CSV
          <input type="file" accept=".csv" onChange={importCSV} style={{ display: 'none' }} />
        </label>
        <Button size="sm" variant="primary" onClick={() => setShowAdd(true)} icon={PlusIcon}>Add Student</Button>
      </div>

      <table className="roster-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll No.</th>
            <th>Department</th>
            <th>Semester</th>
            <th>Batch</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((s) => (
            <tr key={s.id} className={editId === s.id ? 'editing' : ''}>
              <td>{s.name}</td>
              <td>{s.roll}</td>
              <td>{s.department}</td>
              <td>{s.semester}</td>
              <td>{s.batch}</td>
              <td>{s.email}</td>
              <td className="action-cell">
                <Button size="xs" variant="secondary" onClick={() => setEditId(s.id)} icon={EditIcon}>Edit</Button>
                <Button size="xs" variant="danger" onClick={() => deleteStudent(s.id)} icon={TrashIcon}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editId && (
        <div className="edit-panel">
          <h3>Edit Student</h3>
          <Input label="Name" type="text" value={editVals.name} onChange={(e) => setEditVals((v) => ({ ...v, name: e.target.value }))} />
          <Input label="Roll No." type="text" value={editVals.roll} onChange={(e) => setEditVals((v) => ({ ...v, roll: e.target.value }))} />
          <Input label="Department" type="text" value={editVals.department} onChange={(e) => setEditVals((v) => ({ ...v, department: e.target.value }))} />
          <Input label="Semester" type="text" value={editVals.semester} onChange={(e) => setEditVals((v) => ({ ...v, semester: e.target.value }))} />
          <Input label="Batch" type="text" value={editVals.batch} onChange={(e) => setEditVals((v) => ({ ...v, batch: e.target.value }))} />
          <Input label="Email" type="email" value={editVals.email} onChange={(e) => setEditVals((v) => ({ ...v, email: e.target.value }))} />
          <div className="detail-actions">
            <Button variant="primary" onClick={() => { updateStudent(editId, editVals); setEditId(null); }} icon={CheckIcon}>Save</Button>
            <Button variant="secondary" onClick={() => setEditId(null)} icon={XIcon}>Cancel</Button>
          </div>
          <h4>Exam Participation History</h4>
          <ul>
            {editId && (students.find(st => st.id === editId)?.participation || []).map((p, i) => (
              <li key={i}>{p.exam} – {p.date} – {p.status}</li>
            ))}
          </ul>
        </div>
      )}

      {showAdd && (
        <div className="add-panel">
          <h3>Add New Student</h3>
          <Input label="Name" type="text" value={newStudent.name} onChange={(e) => setNewStudent((v) => ({ ...v, name: e.target.value }))} />
          <Input label="Roll No." type="text" value={newStudent.roll} onChange={(e) => setNewStudent((v) => ({ ...v, roll: e.target.value }))} />
          <Input label="Department" type="text" value={newStudent.department} onChange={(e) => setNewStudent((v) => ({ ...v, department: e.target.value }))} />
          <Input label="Semester" type="text" value={newStudent.semester} onChange={(e) => setNewStudent((v) => ({ ...v, semester: e.target.value }))} />
          <Input label="Batch" type="text" value={newStudent.batch} onChange={(e) => setNewStudent((v) => ({ ...v, batch: e.target.value }))} />
          <Input label="Email" type="email" value={newStudent.email} onChange={(e) => setNewStudent((v) => ({ ...v, email: e.target.value }))} />
          <div className="detail-actions">
            <Button variant="primary" onClick={addStudent} icon={CheckIcon}>Add</Button>
            <Button variant="secondary" onClick={() => setShowAdd(false)} icon={XIcon}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};
