import { geneticAlgorithmUtils } from '../src';

describe('geneticAlgorithmUtils', () => {
  describe('binaryGeneGenerator', () => {
    it('should return either 0 or 1', () => {
      const gene = geneticAlgorithmUtils.binaryGeneGenerator();
      expect([0, 1]).toContain(gene);
    });

    it('should return both 0 and 1 with enough trials', () => {
      const results = new Set<number>();
      // Run many times to ensure we get both 0 and 1
      for (let i = 0; i < 100; i++) {
        results.add(geneticAlgorithmUtils.binaryGeneGenerator());
        if (results.size === 2) break;
      }
      expect(results.size).toBe(2);
    });
  });

  describe('binaryToDecimal', () => {
    it('should correctly convert binary arrays to decimal', () => {
      expect(geneticAlgorithmUtils.binaryToDecimal([0, 0, 0, 0])).toBe(0);
      expect(geneticAlgorithmUtils.binaryToDecimal([1, 0, 0, 0])).toBe(8);
      expect(geneticAlgorithmUtils.binaryToDecimal([1, 1, 0, 0])).toBe(12);
      expect(geneticAlgorithmUtils.binaryToDecimal([1, 1, 1, 1])).toBe(15);
    });

    it('should throw an error for non-binary values', () => {
      expect(() => geneticAlgorithmUtils.binaryToDecimal([0, 2, 0])).toThrow();
      expect(() => geneticAlgorithmUtils.binaryToDecimal([1, -1, 1])).toThrow();
    });
  });

  describe('realValueGeneGenerator', () => {
    it('should generate values within range', () => {
      const generator = geneticAlgorithmUtils.realValueGeneGenerator(5, 10);
      for (let i = 0; i < 100; i++) {
        const value = generator();
        expect(value).toBeGreaterThanOrEqual(5);
        expect(value).toBeLessThan(10);
      }
    });
  });
});
