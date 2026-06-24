using System.Diagnostics;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace Trendify.Modules.VideoEngine.Infrastructure;

public sealed class PythonSidecarResult
{
    public string Status { get; init; } = "failed";
    public string? OutputUrl { get; init; }
    public short? DurationSeconds { get; init; }
    public long? FileSizeBytes { get; init; }
    public double? RenderDurationSeconds { get; init; }
    public string? Error { get; init; }
}

public sealed class PythonSidecarService
{
    private readonly string _pythonPath;
    private readonly string _workerScript;
    private readonly ILogger<PythonSidecarService> _logger;

    public PythonSidecarService(
        string pythonPath,
        string workerScriptPath,
        ILogger<PythonSidecarService> logger)
    {
        _pythonPath = pythonPath;
        _workerScript = workerScriptPath;
        _logger = logger;
    }

    public async Task<PythonSidecarResult> CallAsync(
        string jobId, object jobConfig, CancellationToken ct = default)
    {
        var configJson = JsonSerializer.Serialize(jobConfig, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        });

        var psi = new ProcessStartInfo
        {
            FileName = _pythonPath,
            Arguments = $"\"{_workerScript}\" --job-id \"{jobId}\" --config '{configJson.Replace("'", "'\"'\"'")}'",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
        };

        _logger.LogInformation("Calling Python sidecar: {Args}", psi.Arguments);

        using var process = new Process { StartInfo = psi };
        var stdoutBuilder = new System.Text.StringBuilder();
        var stderrBuilder = new System.Text.StringBuilder();

        process.Start();

        var stdoutTask = process.StandardOutput.ReadToEndAsync();
        var stderrTask = process.StandardError.ReadToEndAsync();

        var waitTask = process.WaitForExitAsync(ct);
        var timeoutTask = Task.Delay(TimeSpan.FromMinutes(5), ct);

        var completed = await Task.WhenAny(waitTask, timeoutTask);

        if (completed == timeoutTask)
        {
            try { process.Kill(entireProcessTree: true); } catch { }
            _logger.LogError("Python sidecar timed out for job {JobId}", jobId);
            return new PythonSidecarResult
            {
                Status = "failed",
                Error = "Render timed out after 5 minutes",
            };
        }

        var stdout = await stdoutTask;
        var stderr = await stderrTask;

        if (process.ExitCode != 0)
        {
            _logger.LogError("Python sidecar failed (exit {ExitCode}): {Error}",
                process.ExitCode, stderr);
            return new PythonSidecarResult
            {
                Status = "failed",
                Error = string.IsNullOrEmpty(stderr) ? "Unknown error" : stderr,
            };
        }

        try
        {
            var result = JsonSerializer.Deserialize<PythonSidecarResult>(stdout, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            });

            return result ?? new PythonSidecarResult
            {
                Status = "failed",
                Error = "Failed to parse Python output",
            };
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to parse Python output: {Output}", stdout);
            return new PythonSidecarResult
            {
                Status = "failed",
                Error = $"Invalid output from render worker: {ex.Message}",
            };
        }
    }
}
