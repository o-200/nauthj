import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonService {
  separateFields<T, K extends keyof T>(
    entity: T,
    updateDto: Partial<T>,
    allowedFields: readonly K[],
  ): Partial<Pick<T, K>> {
    const changedFields: Partial<Pick<T, K>> = {};

    for (const key of allowedFields) {
      const value = updateDto[key];

      if (value !== undefined && entity[key] !== value) {
        changedFields[key] = value;
      }
    }

    return changedFields;
  }
}
