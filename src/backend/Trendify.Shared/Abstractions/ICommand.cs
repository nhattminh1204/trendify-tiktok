using MediatR;

namespace Trendify.Shared.Abstractions;

// Marker interfaces — adapted from kgrzybek/modular-monolith-with-ddd
// Stronger typing than raw IRequest<T>; lets us apply behaviors selectively.

public interface ICommand : IRequest { }

public interface ICommand<out TResult> : IRequest<TResult> { }

public interface IQuery<out TResult> : IRequest<TResult> { }

public interface ICommandHandler<in TCommand> : IRequestHandler<TCommand>
    where TCommand : ICommand { }

public interface ICommandHandler<in TCommand, TResult> : IRequestHandler<TCommand, TResult>
    where TCommand : ICommand<TResult> { }

public interface IQueryHandler<in TQuery, TResult> : IRequestHandler<TQuery, TResult>
    where TQuery : IQuery<TResult> { }
