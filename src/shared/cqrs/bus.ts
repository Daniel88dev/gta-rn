import { err, type Result } from '../domain';
import type { Command, CommandHandler, Query, QueryHandler, QueryResult } from './types';

export class CommandBus {
  private readonly handlers = new Map<string, CommandHandler<Command>>();

  register<C extends Command>(type: C['type'], handler: CommandHandler<C>): void {
    if (this.handlers.has(type)) throw new Error(`Command handler already registered: ${type}`);
    this.handlers.set(type, handler as CommandHandler<Command>);
  }

  async dispatch<C extends Command>(command: C): Promise<Result<void>> {
    const handler = this.handlers.get(command.type);
    if (!handler) return err({ code: 'NO_HANDLER', message: `No handler for ${command.type}` });
    return handler(command);
  }
}

export class QueryBus {
  private readonly handlers = new Map<string, QueryHandler<Query>>();

  register<Q extends Query>(type: Q['type'], handler: QueryHandler<Q>): void {
    if (this.handlers.has(type)) throw new Error(`Query handler already registered: ${type}`);
    this.handlers.set(type, handler as unknown as QueryHandler<Query>);
  }

  async ask<Q extends Query>(query: Q): Promise<QueryResult<Q>> {
    const handler = this.handlers.get(query.type);
    if (!handler) throw new Error(`No handler for ${query.type}`);
    return handler(query) as Promise<QueryResult<Q>>;
  }
}
