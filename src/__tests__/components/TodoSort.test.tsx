import { render, fireEvent } from '../utils/test-utils';
import { vi } from 'vitest';
import { TodoSort } from '@/components/TodoSort';

describe('TodoSort', () => {
  const testID = 'test-sort';

  it('calls onChange when Select value changes', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <TodoSort 
        value="latest" 
        onChange={onChange}
        testID={testID}
      />
    );
    
    // Verify title is rendered
    expect(getByTestId(`${testID}-title`)).toHaveTextContent('Your Tasks');
    
    // Verify select trigger is rendered
    const trigger = getByTestId(`${testID}-trigger`);
    expect(trigger).toBeInTheDocument();
    
    // Trigger value change
    fireEvent.click(trigger);
    const priorityOption = getByTestId(`${testID}-option-priority`);
    fireEvent.click(priorityOption);
    
    expect(onChange).toHaveBeenCalledWith('priority');
  });
}); 