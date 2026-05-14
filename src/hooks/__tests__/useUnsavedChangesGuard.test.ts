/// <reference types="jest" />

jest.mock('next/navigation', () => ({
  usePathname: () => '/current',
  useSearchParams: () => new URLSearchParams(''),
}));

jest.mock('react', () => {
  const actual = jest.requireActual('react');

  return {
    ...actual,
    useRef: (initial: any) => ({ current: initial }),
    useMemo: (fn: any) => fn(),
    useCallback: (fn: any) => fn,
    useEffect: (fn: any) => fn(),
  };
});

import { useUnsavedChangesGuard } from '../useUnsavedChangesGuard';

describe('useUnsavedChangesGuard', () => {
  it('bypasses beforeunload once after user confirms navigation (no double confirmation)', () => {
    const windowListeners: Record<string, any> = {};
    const documentListeners: Record<string, any> = {};

    const setTimeoutSpy = jest.fn();

    (global as any).window = {
      location: {
        pathname: '/current',
        search: '',
        hash: '',
        href: 'http://example.com/current',
        origin: 'http://example.com',
      },
      addEventListener: jest.fn((evt: string, handler: any) => {
        windowListeners[evt] = handler;
      }),
      removeEventListener: jest.fn(),
      confirm: jest.fn(() => true),
      setTimeout: setTimeoutSpy,
      history: {
        pushState: jest.fn(),
      },
    };

    (global as any).history = (global as any).window.history;

    (global as any).document = {
      addEventListener: jest.fn((evt: string, handler: any) => {
        documentListeners[evt] = handler;
      }),
      removeEventListener: jest.fn(),
    };

    useUnsavedChangesGuard({ isDirty: true });

    const clickHandler = documentListeners.click;
    const beforeUnloadHandler = windowListeners.beforeunload;

    expect(typeof clickHandler).toBe('function');
    expect(typeof beforeUnloadHandler).toBe('function');

    const anchor = {
      href: 'http://example.com/next',
      target: undefined,
      hasAttribute: (name: string) => name === 'download' ? false : false,
      getAttribute: (name: string) => {
        if (name === 'href') return '/next';
        if (name === 'rel') return null;
        return null;
      },
    };

    const clickEvent: any = {
      metaKey: false,
      altKey: false,
      ctrlKey: false,
      shiftKey: false,
      button: 0,
      target: {
        closest: (selector: string) => (selector === 'a[href]' ? anchor : null),
      },
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    };

    clickHandler(clickEvent);

    expect((global as any).window.confirm).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

    const beforeUnloadEvent: any = {
      preventDefault: jest.fn(),
      returnValue: undefined,
    };

    beforeUnloadHandler(beforeUnloadEvent);

    expect(beforeUnloadEvent.preventDefault).not.toHaveBeenCalled();
    expect(beforeUnloadEvent.returnValue).toBeUndefined();
  });
});
