namespace Trendify.Shared.Errors;

public static class ErrorCodes
{
    // Auth
    public const string Unauthorized = "UNAUTHORIZED";
    public const string Forbidden = "FORBIDDEN";
    public const string InvalidCredentials = "INVALID_CREDENTIALS";
    public const string TokenExpired = "TOKEN_EXPIRED";
    public const string InvalidToken = "INVALID_TOKEN";
    public const string DuplicateEmail = "DUPLICATE_EMAIL";

    // General
    public const string NotFound = "NOT_FOUND";
    public const string ValidationError = "VALIDATION_ERROR";
    public const string RateLimited = "RATE_LIMITED";
    public const string InternalError = "INTERNAL_ERROR";
    public const string UpstreamError = "UPSTREAM_ERROR";

    // AI
    public const string AIBudgetExceeded = "AI_BUDGET_EXCEEDED";
    public const string AIProviderUnavailable = "AI_PROVIDER_UNAVAILABLE";
    public const string PromptNotFound = "PROMPT_NOT_FOUND";
    public const string PromptVariableMissing = "PROMPT_VARIABLE_MISSING";

    // Accounts
    public const string UserNotFound = "USER_NOT_FOUND";
    public const string WorkspaceNotFound = "WORKSPACE_NOT_FOUND";
    public const string SocialAccountNotFound = "SOCIAL_ACCOUNT_NOT_FOUND";
    public const string SocialAccountAlreadyConnected = "SOCIAL_ACCOUNT_ALREADY_CONNECTED";
    public const string AccountNotConnected = "ACCOUNT_NOT_CONNECTED";
    public const string TikTokAuthFailed = "TIKTOK_AUTH_FAILED";
    public const string InvalidOAuthState = "INVALID_OAUTH_STATE";

    // Trends
    public const string TrendNotFound = "TREND_NOT_FOUND";
    public const string TrendAlreadyWatched = "TREND_ALREADY_WATCHED";
    public const string TrendNotWatched = "TREND_NOT_WATCHED";

    // Content
    public const string IdeaNotFound = "IDEA_NOT_FOUND";
    public const string PipelineRunning = "PIPELINE_RUNNING";
    public const string AssetNotFound = "ASSET_NOT_FOUND";
    
    // Products
    public const string ProductNotFound = "PRODUCT_NOT_FOUND";
    public const string ProductAlreadyExists = "PRODUCT_ALREADY_EXISTS";
    public const string ProductAlreadyInWatchlist = "PRODUCT_ALREADY_IN_WATCHLIST";
    public const string ProductNotInWatchlist = "PRODUCT_NOT_IN_WATCHLIST";

    // Video Engine
    public const string RenderJobNotFound = "RENDER_JOB_NOT_FOUND";
    public const string RenderJobNotQueued = "RENDER_JOB_NOT_QUEUED";
    public const string RenderTimedOut = "RENDER_TIMED_OUT";
    public const string RenderFailed = "RENDER_FAILED";
    public const string PythonSidecarError = "PYTHON_SIDECAR_ERROR";
}
