export const getBorderClass = (level: number | null | undefined): string => {
  if (!level) return '';
  
  if (level >= 50) return 'border-4 border-purple-500 shadow-lg shadow-purple-500/50';
  if (level >= 40) return 'border-4 border-red-500 shadow-lg shadow-red-500/50';
  if (level >= 30) return 'border-4 border-yellow-500 shadow-lg shadow-yellow-500/50';
  if (level >= 20) return 'border-4 border-green-500 shadow-lg shadow-green-500/50';
  if (level >= 10) return 'border-4 border-blue-500 shadow-lg shadow-blue-500/50';
  
  return '';
};