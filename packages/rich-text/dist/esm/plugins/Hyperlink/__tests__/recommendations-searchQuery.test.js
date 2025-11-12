describe('HyperlinkModal recommendations.searchQuery feature', ()=>{
    it('should pass linkText as searchQuery to selectSingleEntry', ()=>{
        const mockSelectSingleEntry = jest.fn();
        const linkText = 'example search text';
        const expectedOptions = {
            locale: 'en-US',
            contentTypes: [
                'exampleCT'
            ],
            recommendations: {
                searchQuery: linkText
            }
        };
        mockSelectSingleEntry(expectedOptions);
        expect(mockSelectSingleEntry).toHaveBeenCalledWith(expectedOptions);
        expect(mockSelectSingleEntry).toHaveBeenCalledWith(expect.objectContaining({
            recommendations: {
                searchQuery: linkText
            }
        }));
    });
    it('should update searchQuery when linkText changes', ()=>{
        const mockSelectSingleEntry = jest.fn();
        const modifiedText = 'modified text';
        const expectedOptions = {
            locale: 'en-US',
            contentTypes: [
                'exampleCT'
            ],
            recommendations: {
                searchQuery: modifiedText
            }
        };
        mockSelectSingleEntry(expectedOptions);
        expect(mockSelectSingleEntry).toHaveBeenCalledWith(expect.objectContaining({
            recommendations: {
                searchQuery: modifiedText
            }
        }));
    });
    it('should handle empty linkText', ()=>{
        const mockSelectSingleEntry = jest.fn();
        const expectedOptions = {
            locale: 'en-US',
            contentTypes: [
                'exampleCT'
            ],
            recommendations: {
                searchQuery: ''
            }
        };
        mockSelectSingleEntry(expectedOptions);
        expect(mockSelectSingleEntry).toHaveBeenCalledWith(expect.objectContaining({
            recommendations: {
                searchQuery: ''
            }
        }));
    });
});
