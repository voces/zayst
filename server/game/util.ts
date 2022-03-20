class AbsurdError extends Error {
  constructor(message: string, readonly value: unknown) {
    super(message);
  }
}

export const absurd = (value: never) => {
  const error = new AbsurdError("Unexpected value", value);
  throw error;
};

export const capitalize = <S extends string>(s: S) =>
  (s[0].toUpperCase() + s.slice(1)) as Capitalize<S>;
