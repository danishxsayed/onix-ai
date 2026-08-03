import { render, screen } from '@testing-library/react';
import ScoreBar from '@/components/ui/ScoreBar';

describe('ScoreBar', () => {
  it('renders label and score percentage', () => {
    render(<ScoreBar label="Financial Docs" score={82} />);
    expect(screen.getByText('Financial Docs')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
  });

  it('renders a score of 0 correctly', () => {
    render(<ScoreBar label="Legal Readiness" score={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders a score of 100 correctly', () => {
    render(<ScoreBar label="Team & Ops" score={100} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('applies green color for score >= 75', () => {
    render(<ScoreBar label="High Score" score={80} />);
    const scoreEl = screen.getByText('80%');
    expect(scoreEl).toHaveStyle({ color: 'var(--onix-green)' });
  });

  it('applies amber color for score between 50 and 74', () => {
    render(<ScoreBar label="Mid Score" score={65} />);
    const scoreEl = screen.getByText('65%');
    expect(scoreEl).toHaveStyle({ color: 'var(--onix-amber)' });
  });

  it('applies red color for score below 50', () => {
    render(<ScoreBar label="Low Score" score={30} />);
    const scoreEl = screen.getByText('30%');
    expect(scoreEl).toHaveStyle({ color: 'var(--onix-red)' });
  });
});
