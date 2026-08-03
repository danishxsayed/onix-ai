import { render, screen, fireEvent } from '@testing-library/react';
import PipelineTable from '@/components/ui/PipelineTable';
import { Deal } from '@/lib/api';

const mockDeals: Deal[] = [
  {
    id: '1',
    user_id: 'user-1',
    name: 'Acme Corp',
    sector: 'Technology',
    stage: 'Diagnose',
    value: '$5M',
    fit_score: 78,
    assigned_agent: 'John Smith',
    status: 'active',
    created_at: '2026-07-01T00:00:00Z',
  },
  {
    id: '2',
    user_id: 'user-1',
    name: 'Beta Industries',
    sector: 'Finance',
    stage: 'Match',
    value: '$12M',
    fit_score: 91,
    assigned_agent: 'Sara Lee',
    status: 'active',
    created_at: '2026-07-02T00:00:00Z',
  },
];

describe('PipelineTable', () => {
  it('renders all deal rows', () => {
    render(<PipelineTable deals={mockDeals} onAdvance={jest.fn()} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Beta Industries')).toBeInTheDocument();
  });

  it('renders correct columns for each deal', () => {
    render(<PipelineTable deals={mockDeals} onAdvance={jest.fn()} />);
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('$5M')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<PipelineTable deals={[]} onAdvance={jest.fn()} />);
    expect(screen.getByText('Deal')).toBeInTheDocument();
    expect(screen.getByText('Sector')).toBeInTheDocument();
    expect(screen.getByText('Stage')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Fit Score')).toBeInTheDocument();
    expect(screen.getByText('Agent')).toBeInTheDocument();
  });

  it('shows empty state message when no deals', () => {
    render(<PipelineTable deals={[]} onAdvance={jest.fn()} />);
    expect(screen.getByText(/No deals yet/i)).toBeInTheDocument();
  });

  it('calls onAdvance with correct deal id when stage button clicked', () => {
    const onAdvance = jest.fn();
    render(<PipelineTable deals={mockDeals} onAdvance={onAdvance} />);
    const advanceButtons = screen.getAllByTitle('Click to advance stage');
    fireEvent.click(advanceButtons[0]);
    expect(onAdvance).toHaveBeenCalledTimes(1);
    expect(onAdvance).toHaveBeenCalledWith('1');
  });

  it('renders fit score with % suffix', () => {
    render(<PipelineTable deals={mockDeals} onAdvance={jest.fn()} />);
    expect(screen.getByText('91%')).toBeInTheDocument();
  });
});
