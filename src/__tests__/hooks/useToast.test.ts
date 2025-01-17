import { renderHook, act } from '@testing-library/react';
import { useToast } from '@/hooks/useToast';

describe('useToast', () => {
  beforeEach(() => {
    // Clear any existing toasts between tests
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.dismiss();
    });
  });

  it('should add a toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'This is a test toast',
        variant: 'default',
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: 'Test Toast',
      description: 'This is a test toast',
      variant: 'default',
      open: true,
    });
  });

  it('should respect toast limit', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      // Add multiple toasts
      result.current.toast({ title: 'Toast 1' });
      result.current.toast({ title: 'Toast 2' });
      result.current.toast({ title: 'Toast 3' });
    });

    // Should only keep the most recent toast due to TOAST_LIMIT = 1
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Toast 3');
  });

  it('should update a toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      const toast = result.current.toast({
        title: 'Initial Toast',
        description: 'Initial description',
      });

      // Update the toast with new content
      result.current.toast({
        ...toast,
        title: 'Updated Toast',
        description: 'Updated description',
      });
    });

    expect(result.current.toasts[0]).toMatchObject({
      title: 'Updated Toast',
      description: 'Updated description',
    });
  });

  it('should dismiss a specific toast', () => {
    const { result } = renderHook(() => useToast());
    let toastId: string;
    
    act(() => {
      const { id } = result.current.toast({
        title: 'Test Toast',
      });
      toastId = id;
    });

    act(() => {
      result.current.dismiss(toastId);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should dismiss all toasts', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Toast 1' });
    });

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should handle onOpenChange callback', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
      });
    });

    act(() => {
      // Simulate closing the toast via onOpenChange in a separate act
      result.current.toasts[0].onOpenChange?.(false);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should generate unique ids for toasts', () => {
    const { result } = renderHook(() => useToast());
    const ids = new Set<string>();
    
    act(() => {
      // Create multiple toasts and collect their IDs
      const toast1 = result.current.toast({ title: 'Toast 1' });
      const toast2 = result.current.toast({ title: 'Toast 2' });
      
      ids.add(toast1.id);
      ids.add(toast2.id);
    });

    // Should have unique IDs for each toast
    expect(ids.size).toBe(2);
  });
}); 