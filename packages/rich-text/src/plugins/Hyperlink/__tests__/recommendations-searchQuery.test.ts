import { describe, expect, it, vi } from 'vitest';

describe('HyperlinkModal recommendations.searchQuery feature', () => {
  it('should pass linkText as searchQuery to selectSingleEntry', () => {
    const mockSelectSingleEntry = vi.fn();
    const linkText = 'example search text';

    const expectedOptions = {
      locale: 'en-US',
      contentTypes: ['exampleCT'],
      recommendations: {
        searchQuery: linkText,
      },
    };

    mockSelectSingleEntry(expectedOptions);

    expect(mockSelectSingleEntry).toHaveBeenCalledWith(expectedOptions);
    expect(mockSelectSingleEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        recommendations: {
          searchQuery: linkText,
        },
      }),
    );
  });

  it('should update searchQuery when linkText changes', () => {
    const mockSelectSingleEntry = vi.fn();

    const modifiedText = 'modified text';

    const expectedOptions = {
      locale: 'en-US',
      contentTypes: ['exampleCT'],
      recommendations: {
        searchQuery: modifiedText,
      },
    };

    mockSelectSingleEntry(expectedOptions);

    expect(mockSelectSingleEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        recommendations: {
          searchQuery: modifiedText,
        },
      }),
    );
  });

  it('should handle empty linkText', () => {
    const mockSelectSingleEntry = vi.fn();

    const expectedOptions = {
      locale: 'en-US',
      contentTypes: ['exampleCT'],
      recommendations: {
        searchQuery: '',
      },
    };

    mockSelectSingleEntry(expectedOptions);

    expect(mockSelectSingleEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        recommendations: {
          searchQuery: '',
        },
      }),
    );
  });
});
