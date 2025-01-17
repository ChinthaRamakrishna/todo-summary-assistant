import { render, fireEvent } from '../utils/test-utils';
import { vi } from 'vitest';
import { DatePicker } from '@/components/DatePicker';

describe('DatePicker', () => {
  const testID = 'test-date-picker';
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with placeholder when no date is selected', () => {
    const { getByTestId } = render(
      <DatePicker 
        onSelect={mockOnSelect}
        testID={testID}
      />
    );

    const trigger = getByTestId(`${testID}-trigger`);
    expect(trigger).toHaveTextContent('Set due date');
  });

  it('renders with formatted date when date is provided', () => {
    const testDate = new Date('2024-03-20T12:00:00Z');
    const { getByTestId } = render(
      <DatePicker 
        date={testDate}
        onSelect={mockOnSelect}
        testID={testID}
      />
    );

    const trigger = getByTestId(`${testID}-trigger`);
    expect(trigger).toHaveTextContent('03/20/2024');
  });

  it('opens calendar popover when clicked', () => {
    const { getByTestId } = render(
      <DatePicker 
        onSelect={mockOnSelect}
        testID={testID}
      />
    );

    const trigger = getByTestId(`${testID}-trigger`);
    fireEvent.click(trigger);

    const content = getByTestId(`${testID}-content`);
    expect(content).toBeInTheDocument();
  });

  it('uses custom placeholder when provided', () => {
    const customPlaceholder = "Choose a date";
    const { getByTestId } = render(
      <DatePicker 
        onSelect={mockOnSelect}
        placeholder={customPlaceholder}
        testID={testID}
      />
    );

    const trigger = getByTestId(`${testID}-trigger`);
    expect(trigger).toHaveTextContent(customPlaceholder);
  });
}); 