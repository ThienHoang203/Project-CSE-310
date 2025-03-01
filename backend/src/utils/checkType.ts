export function getIntValue(value: string): number | null {
  if (value === '') return null;

  const parsedIntValue = parseInt(value);

  if (isNaN(parsedIntValue)) return null;

  return parsedIntValue;
}
