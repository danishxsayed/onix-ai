import { render, screen } from '@testing-library/react';
import MetricCard from '@/components/ui/MetricCard';

describe('MetricCard', () => {
  it('renders label and value', () => {
    render(<MetricCard label="Active Deals" value={12} change={8} />);
    expect(screen.getByText('Active Deals')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders prefix before value', () => {
    render(<MetricCard label="Total Value" value="4.8M" change={12} prefix="$" />);
    expect(screen.getByText('$4.8M')).toBeInTheDocument();
  });

  it('shows upward arrow and percentage for positive change', () => {
    render(<MetricCard label="Deals" value={5} change={10} />);
    expect(screen.getByText(/↑/)).toBeInTheDocument();
    expect(screen.getByText(/10%/)).toBeInTheDocument();
  });

  it('shows downward arrow for negative change', () => {
    render(<MetricCard label="Deals" value={5} change={-3} />);
    expect(screen.getByText(/↓/)).toBeInTheDocument();
    expect(screen.getByText(/3%/)).toBeInTheDocument();
  });

  it('treats zero change as positive', () => {
    render(<MetricCard label="Deals" value={0} change={0} />);
    expect(screen.getByText(/↑/)).toBeInTheDocument();
  });
});
