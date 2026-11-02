/**
 * Minimal in-process CQRS primitives.
 * Commands change state and return nothing but success/failure.
 * Queries read state and never change it.
 */
import type { Result } from '../domain';

export interface Command<TType extends string = string> {
  readonly type: TType;
}

export interface Query<TType extends string = string, TResult = unknown> {
  readonly type: TType;
  /** Phantom field that carries the result type; never set at runtime. */
  readonly __result?: TResult;
}

export type QueryResult<Q> = Q extends Query<string, infer R> ? R : never;

export type CommandHandler<C extends Command> = (command: C) => Promise<Result<void>>;
export type QueryHandler<Q extends Query> = (query: Q) => Promise<QueryResult<Q>>;
