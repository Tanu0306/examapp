import React, { useState } from 'react';
import { MOCK_RESULTS } from '../../data/resultsStore';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import './ResultsPage.css';

export const ResultsPage = () => {
  const [results] = useState(MOCK_RESULTS);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showExport, setShowExport] = useState(false);

  // ----- Statistics -----
  const total = results.length;
  const avgScore = (results.reduce((sum, r) => sum + r.score, 0) / total).toFixed(2);
  const highest = Math.max(...results.map(r => r.score));
  const lowest = Math.min(...results.map(r => r.score));
  const passCount = results.filter(r => r.pass).length;
  const passPct = ((passCount / total) * 100).toFixed(1);

  // Grade distribution (A:90+, B:80-89, C:70-79, D:60-69, F:<60)
  const gradeDist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  results.forEach(r => {
    const s = r.score;
    if (s >= 90) gradeDist.A++;
    else if (s >= 80) gradeDist.B++;
    else if (s >= 70) gradeDist.C++;
    else if (s >= 60) gradeDist.D++;
    else gradeDist.F++;
  });

  // ----- Filtering -----
  const filtered = results.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.examTitle.toLowerCase().includes(search.toLowerCase())
  );

  // ----- Export CSV -----
  const handleExport = () => {
    const csvRows = [];
    csvRows.push('Student ID,Name,Exam ID,Exam Title,Score,Max Score,Pass');
    results.forEach(r => {
      csvRows.push(`${r.studentId},${r.name},${r.examId},${r.examTitle},${r.score},${r.maxScore},${r.pass}`);
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'exam_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExport(true);
  };

  // ----- Print -----
  const handlePrint = () => {
    window.print();
  };

  // ----- Render -----
  return (
    <div className="results-page">
      <h2>Exam Results &amp; Reports</h2>

      {/* Statistics */}
      <div className="stats-grid">
        <div>Class Avg: {avgScore}%</div>
        <div>Highest: {highest}</div>
        <div>Lowest: {lowest}</div>
        <div>Pass: {passPct}% ({passCount}/{total})</div>
        <div>Grade Dist – A:{gradeDist.A} B:{gradeDist.B} C:{gradeDist.C} D:{gradeDist.D} F:{gradeDist.F}</div>
      </div>

      {/* Controls */}
      <div className="controls">
        <Input
          placeholder="Search by student or exam"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <Button onClick={handleExport}>Export CSV</Button>
        <Button onClick={handlePrint}>Print Report</Button>
      </div>

      {/* Results Table */}
      <table className="results-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Exam</th>
            <th>Score</th>
            <th>Max</th>
            <th>Pass?</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, idx) => (
            <tr key={idx} onClick={() => setSelected(r)} className="clickable-row">
              <td>{r.name}</td>
              <td>{r.examTitle}</td>
              <td>{r.score}</td>
              <td>{r.maxScore}</td>
              <td>{r.pass ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detail Modal */}
      {selected && (
        <Modal onClose={() => setSelected(null)} title="Student Result Details">
          <p><strong>Student:</strong> {selected.name} (ID: {selected.studentId})</p>
          <p><strong>Exam:</strong> {selected.examTitle} (ID: {selected.examId})</p>
          <p><strong>Score:</strong> {selected.score} / {selected.maxScore}</p>
          <p><strong>Pass:</strong> {selected.pass ? 'Yes' : 'No'}</p>
        </Modal>
      )}

      {/* Export Confirmation */}
      {showExport && (
        <Modal onClose={() => setShowExport(false)} title="Export Completed">
          <p>Results CSV has been downloaded.</p>
        </Modal>
      )}
    </div>
  );
};
