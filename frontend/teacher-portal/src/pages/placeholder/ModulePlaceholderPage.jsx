import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ArrowRightIcon } from '../../components/common/Icons';

export const ModulePlaceholderPage = ({
  title,
  phase,
  description,
  features = [],
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto 0 auto' }}>
      <Card>
        <CardHeader
          title={title}
          subtitle={`Examination Management System — Development Roadmap`}
          badge={<Badge variant="primary" size="sm">{phase}</Badge>}
        />
        <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ fontSize: '0.9375rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
            {description}
          </p>

          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
          }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Planned Module Specifications:
            </h4>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {features.map((feat, i) => (
                <li key={i}>{feat}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <Button variant="secondary" size="md" onClick={() => navigate('/')}>
              &larr; Back to Dashboard
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
