using MediatR;

namespace Trendify.Modules.VideoEngine.Application.Commands;

public sealed record CancelRenderJobCommand(Guid Id) : IRequest<Unit>;
