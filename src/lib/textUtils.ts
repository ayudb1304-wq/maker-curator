// Utility functions for text handling and validation

export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const validateWordLimit = (text: string, limit: number): boolean => {
  return countWords(text) <= limit;
};

export const getWordCountText = (text: string, limit: number): string => {
  const wordCount = countWords(text);
  return `${wordCount}/${limit} words`;
};

export const getWordCountColor = (text: string, limit: number): string => {
  const wordCount = countWords(text);
  const percentage = (wordCount / limit) * 100;
  
  if (percentage >= 100) return 'text-destructive';
  if (percentage >= 80) return 'text-orange-500';
  return 'text-muted-foreground';
};