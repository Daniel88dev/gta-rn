/** Explicit success/failure value, so domain errors never travel as exceptions. */
export type Result<T, E = DomainError> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export interface DomainError {
  readonly code: string;
  readonly message: string;
}
