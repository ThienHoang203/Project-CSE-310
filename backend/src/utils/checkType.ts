import { BadRequestException } from '@nestjs/common';

export function getIntValue(value: string): number | null {
  if (value === '') return null;

  const parsedIntValue = parseInt(value);

  if (isNaN(parsedIntValue)) return null;

  return parsedIntValue;
}

export function checkAndGetIntValue(
  value: string,
  invalidFormatError: string,
  minValue?: number,
  minValueError?: string,
  maxValue?: number,
  maxValueError?: string,
): number {
  const parsedIntValue = getIntValue(value);

  if (!parsedIntValue) throw new BadRequestException(invalidFormatError);

  if (minValue !== undefined && minValue > parsedIntValue)
    throw new BadRequestException(minValueError ? minValueError : invalidFormatError);

  if (maxValue !== undefined && maxValue < parsedIntValue)
    throw new BadRequestException(maxValueError ? maxValueError : invalidFormatError);

  return parsedIntValue;
}
