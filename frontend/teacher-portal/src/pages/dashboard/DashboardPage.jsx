import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  StudentsIcon,
  ExamIcon,
  MonitoringIcon,
  QuestionsIcon,
  PlusCircleIcon,
  ArrowRightIcon,
  ClockIcon,
  ShieldAlertIcon,
  ServerIcon,
  LaptopIcon,
  CheckIcon,
  AlertTriangleIcon,
} from '../../components/common/Icons';
import {
  MOCK_SYSTEM_METRICS,
  MOCK_ONGOING_EXAMS,
  MOCK_UPCOMING_EXAMS,
  MOCK_RECENT_RESULTS,
} from '../../data/mockData';
import './DashboardPage.css';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      {/* Welcome & Quick Action Hero Bar */}
      <section className="dashboard-topbar">
        <div className="dashboard-heading-group">
          <h2 className="dashboard-welcome-title">
            Welcome back, {user?.name || 'Professor'}
          </h2>
          <p className="dashboard-welcome-sub">
            LAN Examination Node &bull; {user?.activeLab || 'Lab 3 (Systems Lab)'} &bull; Ready for assessment administration.
          </p>
        </div>

        <div className="dashboard-actions">
          <Button
            variant="outline"
            size="md"
            icon={QuestionsIcon}
            onClick={() => navigate('/questions')}
          >
            Question Bank
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={PlusCircleIcon}
            onClick={() => navigate('/exams/create')}
          >
            Create Examination
          </Button>
        </div>
      </section>

      {/* Primary KPI Metric Cards */}
      <section className="dashboard-stats-grid">
        <StatCard
          title="Total Registered Students"
          value={MOCK_SYSTEM_METRICS.totalStudents}
          trend="+12 this semester"
          trendDirection="positive"
          subvalue="across 4 departments"
          icon={StudentsIcon}
          onClick={() => navigate('/students')}
        />

        <StatCard
          title="Total Examinations"
          value={MOCK_SYSTEM_METRICS.totalExams}
          trend="8 Published"
          trendDirection="neutral"
          subvalue="4 Drafts, 6 Archived"
          icon={ExamIcon}
          onClick={() => navigate('/exams')}
        />

        <StatCard
          title="Ongoing Lab Exams"
          value={MOCK_SYSTEM_METRICS.activeExams}
          trend="● LIVE NOW"
          trendDirection="live"
          subvalue={`${MOCK_SYSTEM_METRICS.activeStudentsOnline} active students online`}
          icon={MonitoringIcon}
          badgeText="Active"
          onClick={() => navigate('/monitoring')}
        />

        <StatCard
          title="Questions in Repository"
          value={MOCK_SYSTEM_METRICS.totalQuestions}
          trend="6 Question Formats"
          trendDirection="neutral"
          subvalue="MCQs, Coding, Puzzles..."
          icon={QuestionsIcon}
          onClick={() => navigate('/questions')}
        />
      </section>

      {/* Ongoing Live Examinations Section (Crucial for Teachers) */}
      <section className="dashboard-section">
        <div className="section-header">
          <div className="section-header-title-box">
            <h3 className="section-title">Ongoing Examinations (Real-time LAN)</h3>
            <p className="section-subtitle">
              Active student workstations currently locked into proctored examination sessions.
            </p>
          </div>
          <Badge variant="danger" dot pulse size="md">
            {MOCK_ONGOING_EXAMS.length} Active Sessions
          </Badge>
        </div>

        <div className="ongoing-exams-grid">
          {MOCK_ONGOING_EXAMS.map((exam) => (
            <Card key={exam.id} hover className="ongoing-exam-card">
              <CardHeader
                title={exam.title}
                subtitle={`${exam.code} • ${exam.labRoom}`}
                badge={
                  <Badge variant={exam.type === 'Coding' ? 'primary' : 'warning'} size="sm">
                    {exam.type}
                  </Badge>
                }
                action={
                  <Badge variant="success" dot pulse size="sm">
                    Live
                  </Badge>
                }
              />

              <CardBody className="ongoing-exam-body">
                {/* Live Numbers Strip */}
                <div className="ongoing-stats-strip">
                  <div className="ongoing-stat-col">
                    <span className="stat-col-label">Connected / Enrolled</span>
                    <span className="stat-col-value highlight">
                      {exam.activeStudents} <span className="stat-denom">/ {exam.totalStudents}</span>
                    </span>
                  </div>

                  <div className="ongoing-stat-col">
                    <span className="stat-col-label">Time Remaining</span>
                    <span className="stat-col-value timer">
                      <ClockIcon size={14} />
                      {exam.timeRemainingMinutes} mins
                    </span>
                  </div>

                  <div className="ongoing-stat-col">
                    <span className="stat-col-label">Violations Alert</span>
                    <span className={`stat-col-value ${exam.violationsCount > 0 ? 'text-danger' : 'text-success'}`}>
                      {exam.violationsCount > 0 ? (
                        <>
                          <ShieldAlertIcon size={14} />
                          {exam.violationsCount} Flagged
                        </>
                      ) : (
                        <>
                          <CheckIcon size={14} />
                          Clean (0)
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Progress Bar of Completion */}
                <div className="ongoing-progress-container">
                  <div className="progress-labels">
                    <span>Session Progress</span>
                    <span>
                      {Math.round(((exam.durationMinutes - exam.timeRemainingMinutes) / exam.durationMinutes) * 100)}%
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${((exam.durationMinutes - exam.timeRemainingMinutes) / exam.durationMinutes) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="ongoing-actions-row">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={MonitoringIcon}
                    onClick={() => navigate('/monitoring')}
                  >
                    Open Live Proctoring
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => alert(`Broadcast sent to all candidates in ${exam.labRoom}`)}
                  >
                    Broadcast Announcement
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Two-Column Layout: Upcoming Assessments & Recent Results */}
      <div className="dashboard-two-col">
        {/* Left: Upcoming Examinations */}
        <section className="dashboard-section">
          <Card>
            <CardHeader
              title="Upcoming Examinations"
              subtitle="Scheduled assessments for computer laboratory terminals"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/exams')}
                >
                  View All &rarr;
                </Button>
              }
            />

            <CardBody noPadding>
              <div className="upcoming-exams-list">
                {MOCK_UPCOMING_EXAMS.map((exam) => (
                  <div key={exam.id} className="upcoming-item">
                    <div className="upcoming-meta-col">
                      <span className="upcoming-date-badge">{exam.date}</span>
                      <span className="upcoming-time-text">{exam.time}</span>
                    </div>

                    <div className="upcoming-main-col">
                      <div className="upcoming-title-row">
                        <h4 className="upcoming-title">{exam.title}</h4>
                        <Badge variant="neutral" size="sm">{exam.type}</Badge>
                      </div>
                      <div className="upcoming-sub-row">
                        <span>{exam.format}</span>
                        <span>&bull;</span>
                        <span>{exam.enrolledStudents} Candidates</span>
                        <span>&bull;</span>
                        <span>{exam.labRoom}</span>
                      </div>
                    </div>

                    <div className="upcoming-action-col">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/exams')}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Right: Recently Completed Results & Evaluation */}
        <section className="dashboard-section">
          <Card>
            <CardHeader
              title="Recent Examination Results"
              subtitle="Completed evaluations and grade summaries"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/results')}
                >
                  Reports &rarr;
                </Button>
              }
            />

            <CardBody noPadding>
              <div className="recent-results-table-wrap">
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>Examination</th>
                      <th>Class</th>
                      <th>Average</th>
                      <th>Pass %</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_RECENT_RESULTS.map((res) => (
                      <tr key={res.id}>
                        <td>
                          <div className="table-exam-info">
                            <span className="table-exam-title">{res.examTitle}</span>
                            <span className="table-exam-sub">{res.date} &bull; {res.candidates} students</span>
                          </div>
                        </td>
                        <td>
                          <span className="table-batch-pill">{res.batch}</span>
                        </td>
                        <td>
                          <span className="table-metric-val">{res.avgScore}</span>
                        </td>
                        <td>
                          <Badge variant="success" size="sm">{res.passRate}</Badge>
                        </td>
                        <td className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/results')}
                          >
                            Analyze
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </section>
      </div>
    </div>
  );
};
