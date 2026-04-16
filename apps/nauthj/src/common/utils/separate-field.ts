export function separateFields<
  T extends object,
  K extends readonly (keyof T)[],
>(entity: T, updateDto: Partial<T>, allowedFields: K) {
  type UpdatableField = K[number];
  type ChangedFields = Partial<Pick<T, UpdatableField>>;

  const changedFields: ChangedFields = {};

  const setChangedField = <Key extends UpdatableField>(
    key: Key,
    value: T[Key],
  ) => {
    changedFields[key] = value;
  };

  for (const key of allowedFields) {
    const value = updateDto[key];

    if (value !== undefined && entity[key] !== value) {
      setChangedField(key, value);
    }
  }

  return changedFields;
}
