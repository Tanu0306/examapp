import React from 'react';
import StatusBadge from '../../components/common/StatusBadge';
import './StudentTable.css';

/**
 * Reusable table for displaying a list of students.
 * Expects each student object to contain:
 *   id, name, roll, department, semester, batch, email, status
 */
const StudentTable = ({ students }) => {
  return (
    <table className="student-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Roll No.</th>
          <th>Department</th>
          <th>Semester</th>
          <th>Batch</th>
          <th>Email</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s) => (
          <tr key={s.id} className="readonly-row">
            <td>{s.name}</td>
            <td>{s.roll}</td>
            <td>{s.department}</td>
            <td>{s.semester}</td>
            <td>{s.batch}</td>
            <td>{s.email}</td>
            <td><StatusBadge status={s.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StudentTable;

