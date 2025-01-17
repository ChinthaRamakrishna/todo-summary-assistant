import { render, fireEvent, act, screen } from '../utils/test-utils';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatePicker } from '@/components/DatePicker';

describe('DatePicker', () => {
  const testID = 'test-date-picker';
  const mockOnSelect = vi.fn();
  const testDate = new Date('2024-03-20T12:00:00Z');
  const customPlaceholder = "Choose a date";

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('with default props', () => {
    beforeEach(async () => {
      await act(async () => {
        render(
          <DatePicker 
            onSelect={mockOnSelect}
            testID={testID}
          />
        );
      });
    });

    it('renders with default placeholder', () => {
      expect(screen.getByTestId(`${testID}-trigger`)).toHaveTextContent('Set due date');
    });

    it('opens calendar popover when clicked', async () => {
      await act(async () => {
        fireEvent.click(screen.getByTestId(`${testID}-trigger`));
      });

      expect(screen.getByTestId(`${testID}-content`)).toBeInTheDocument();
    });
  });

  describe('with date prop', () => {
    beforeEach(async () => {
      await act(async () => {
        render(
          <DatePicker 
            date={testDate}
            onSelect={mockOnSelect}
            testID={testID}
          />
        );
      });
    });

    it('renders with formatted date', () => {
      expect(screen.getByTestId(`${testID}-trigger`)).toHaveTextContent('03/20/2024');
    });

    it('shows calendar with selected date when clicked', async () => {
      await act(async () => {
        fireEvent.click(screen.getByTestId(`${testID}-trigger`));
      });

      expect(screen.getByTestId(`${testID}-content`)).toBeInTheDocument();
    });
  });

  describe('with custom placeholder', () => {
    beforeEach(async () => {
      await act(async () => {
        render(
          <DatePicker 
            onSelect={mockOnSelect}
            placeholder={customPlaceholder}
            testID={testID}
          />
        );
      });
    });

    it('uses provided placeholder text', () => {
      expect(screen.getByTestId(`${testID}-trigger`)).toHaveTextContent(customPlaceholder);
    });
  });
}); 