import { describe, it, expect, vi } from 'vitest';
import { act, render, screen } from '../utils/test-utils';
import { TodoSort } from '../../components/TodoSort';

// Mock scrollIntoView since it's not available in JSDOM
Element.prototype.scrollIntoView = vi.fn();

describe('TodoSort', () => {
  it('calls onChange when Select value changes', async () => {
    const onChange = vi.fn();
    const testID = 'todo-sort';

    await act(async () => {
      render(
        <TodoSort 
          value="latest" 
          onChange={onChange}
          testID={testID}
        />
      );
    });

    await act(async () => {
      screen.getByTestId(`${testID}-trigger`).click();
    });

    const priorityOption = await screen.findByTestId(`${testID}-option-priority`);
    
    await act(async () => {
      priorityOption.click();
    });

    expect(onChange).toHaveBeenCalledWith('priority');
  });
}); 