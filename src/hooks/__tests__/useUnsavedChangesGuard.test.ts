/// <reference types="jest" />

jest.mock('next/navigation', () => ({
  usePathname:     () => '/current',
  useSearchParams: () => new URLSearchParams(''),
}));

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useRef:      (initial: unknown) => ({ current: initial }),
    useMemo:     (fn: () => unknown) => fn(),
    useCallback: (fn: (...args: unknown[]) => unknown) => fn,
    useEffect:   (fn: () => void) => fn(),
  };
});

import { useUnsavedChangesGuard } from '../useUnsavedChangesGuard';

describe('useUnsavedChangesGuard', () => {
  it('bypasses beforeunload once after user confirms navigation (no double confirmation)', () => {
    const windowListeners:   Record<string, EventListener> = {};
    const documentListeners: Record<string, EventListener> = {};

    const setTimeoutSpy = jest.fn();

    // ✅ Cast through unknown to avoid the Window shape incompatibility
    (global as unknown as Record<string, unknown>)['window'] = {
      location: {
        pathname: '/current',
        search:   '',
        hash:     '',
        href:     'http://example.com/current',
        origin:   'http://example.com',
      },
      addEventListener: jest.fn((evt: string, handler: EventListener) => {
        windowListeners[evt] = handler;
      }),
      removeEventListener: jest.fn(),
      confirm:     jest.fn(() => true),
      setTimeout:  setTimeoutSpy,
      history: {
        pushState: jest.fn(),
      },
    };

    (global as unknown as Record<string, unknown>)['history'] =
      (global as unknown as Record<string, unknown>)['window'] &&
      ((global as unknown as Record<string, { history: unknown }>)['window']).history;

    (global as unknown as Record<string, unknown>)['document'] = {
      addEventListener: jest.fn((evt: string, handler: EventListener) => {
        documentListeners[evt] = handler;
      }),
      removeEventListener: jest.fn(),
    };

    useUnsavedChangesGuard({ isDirty: true });

    const clickHandler       = documentListeners['click'];
    const beforeUnloadHandler = windowListeners['beforeunload'];

    expect(typeof clickHandler).toBe('function');
    expect(typeof beforeUnloadHandler).toBe('function');

    const anchor = {
      href:         'http://example.com/next',
      target:       undefined,
      hasAttribute: (_name: string) => false,
      getAttribute: (name: string) => {
        if (name === 'href') return '/next';
        if (name === 'rel')  return null;
        return null;
      },
    };

    const clickEvent = {
      metaKey:  false,
      altKey:   false,
      ctrlKey:  false,
      shiftKey: false,
      button:   0,
      target: {
        closest: (selector: string) =>
          selector === 'a[href]' ? anchor : null,
      },
      preventDefault:  jest.fn(),
      stopPropagation: jest.fn(),
    } as unknown as MouseEvent;

    clickHandler(clickEvent);

    expect(
      (global as unknown as Record<string, { confirm: jest.Mock }>)['window'].confirm
    ).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

    // ✅ Cast through unknown to avoid BeforeUnloadEvent shape mismatch
    const beforeUnloadEvent = {
      preventDefault: jest.fn(),
      returnValue:    undefined,
    } as unknown as BeforeUnloadEvent;

    beforeUnloadHandler(beforeUnloadEvent);

    expect(beforeUnloadEvent.preventDefault).not.toHaveBeenCalled();
    expect(beforeUnloadEvent.returnValue).toBeUndefined();
  });
});
