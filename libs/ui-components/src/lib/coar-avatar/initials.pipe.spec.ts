import { CoarInitialsPipe } from './initials.pipe';

describe('CoarInitialsPipe', () => {
  let pipe: CoarInitialsPipe;

  beforeEach(() => {
    pipe = new CoarInitialsPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should return empty string for null', () => {
      expect(pipe.transform(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(pipe.transform(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(pipe.transform('')).toBe('');
    });

    it('should return single initial for single word', () => {
      expect(pipe.transform('Alice')).toBe('A');
    });

    it('should return two initials for two words', () => {
      expect(pipe.transform('Alice Johnson')).toBe('AJ');
    });

    it('should return three initials for three words', () => {
      expect(pipe.transform('Alice Jane Doe')).toBe('AJD');
    });

    it('should limit to 3 initials by default', () => {
      expect(pipe.transform('Alice Jane Doe Smith')).toBe('AJD');
    });

    it('should respect custom maxLength', () => {
      expect(pipe.transform('Alice Jane Doe Smith', 2)).toBe('AJ');
      expect(pipe.transform('Alice Jane Doe Smith', 4)).toBe('AJDS');
    });

    it('should uppercase the result', () => {
      expect(pipe.transform('alice johnson')).toBe('AJ');
    });

    it('should handle extra whitespace', () => {
      expect(pipe.transform('  Alice   Johnson  ')).toBe('AJ');
    });

    it('should handle names with multiple spaces between words', () => {
      expect(pipe.transform('Alice    Jane    Doe')).toBe('AJD');
    });
  });
});
