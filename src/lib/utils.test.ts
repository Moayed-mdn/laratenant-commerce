import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('foo', 'bar');
      expect(result).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active');
      expect(result).toContain('base');
      expect(result).toContain('active');
    });

    it('should handle falsy values', () => {
      const result = cn('foo', false, null, undefined, 'bar');
      expect(result).toBe('foo bar');
    });

    it('should return empty string when no classes provided', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });
});
