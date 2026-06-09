using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Threading;
using System.Windows.Forms;

internal static class Program
{
    private const string HealthUrl = "http://127.0.0.1:4782/api/health";
    private const int HealthAttempts = 30;
    private const int HealthDelayMs = 300;
    private const string NodeVersion = "24.14.0";
    private const string NodeDistBaseUrl = "https://nodejs.org/dist/v24.14.0";
    private static string _launcherLogPath = string.Empty;

    [STAThread]
    private static void Main()
    {
        try
        {
            string root = AppDomain.CurrentDomain.BaseDirectory;
            string dataDir = Path.Combine(root, "data");
            Directory.CreateDirectory(dataDir);
            _launcherLogPath = Path.Combine(dataDir, "launcher-exe.log");
            Log("Launcher started from " + root);

            string launchPage = Path.Combine(root, "src", "web", "launching.html");
            string serverScript = Path.Combine(root, "src", "server", "server.mjs");

            if (!File.Exists(launchPage))
            {
                throw new FileNotFoundException("Launch page was not found.", launchPage);
            }

            if (!File.Exists(serverScript))
            {
                throw new FileNotFoundException("Server script was not found.", serverScript);
            }

            OpenLaunchPage(launchPage, root);

            string nodeExe = ResolveNodeExe(root);
            Log("Using Node runtime " + nodeExe);
            if (!IsHealthy(root))
            {
                Log("Health check failed, starting local server");
                StopProcessOnPort(4782);
                StartServer(root, nodeExe, serverScript);
            }
            else
            {
                Log("Existing local server is already healthy");
            }

            WaitForHealthyServer(root);
            Log("Launcher finished");
        }
        catch (Exception ex)
        {
            Log("Launcher failed: " + ex);
            MessageBox.Show(
                "Offer Dashboard launch failed.\r\n\r\n" + ex.Message,
                "Offer Dashboard",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error
            );
        }
    }

    private static string ResolveNodeExe(string root)
    {
        string systemNode = FindSystemNode();
        if (!string.IsNullOrEmpty(systemNode) && IsCompatibleNode(systemNode))
        {
            return systemNode;
        }

        string runtimeKey = GetWindowsRuntimeKey();
        string runtimeDir = Path.Combine(root, "runtime");
        string downloadsDir = Path.Combine(runtimeDir, "downloads");
        string archiveName = string.Format("node-v{0}-{1}.zip", NodeVersion, runtimeKey);
        string packagePath = Path.Combine(downloadsDir, archiveName);
        string targetDir = Path.Combine(runtimeDir, runtimeKey);

        string existing = FindNodeExeUnder(targetDir);
        if (!string.IsNullOrEmpty(existing) && IsCompatibleNode(existing))
        {
            return existing;
        }

        if (!File.Exists(packagePath))
        {
            Directory.CreateDirectory(downloadsDir);
            string downloadUrl = NodeDistBaseUrl + "/" + archiveName;
            Log("Downloading Node runtime from " + downloadUrl);
            DownloadFile(downloadUrl, packagePath);
        }

        if (!VerifyArchiveChecksum(downloadsDir, packagePath, archiveName))
        {
            File.Delete(packagePath);
            throw new InvalidOperationException("Downloaded Node runtime checksum did not match. Please retry.");
        }

        if (Directory.Exists(targetDir))
        {
            Directory.Delete(targetDir, true);
        }

        Directory.CreateDirectory(targetDir);
        Log("Extracting Node runtime from " + packagePath);
        ZipFile.ExtractToDirectory(packagePath, targetDir);

        string extracted = FindNodeExeUnder(targetDir);
        if (!string.IsNullOrEmpty(extracted) && IsCompatibleNode(extracted))
        {
            return extracted;
        }

        throw new FileNotFoundException("node.exe was not found after extracting the Node runtime.", targetDir);
    }

    private static void OpenLaunchPage(string launchPage, string root)
    {
        string launchUrl = new Uri(launchPage).AbsoluteUri + "?root=" + Uri.EscapeDataString(root);
        Process.Start(new ProcessStartInfo
        {
            FileName = launchUrl,
            UseShellExecute = true
        });
        Log("Opened launching page " + launchUrl);
    }

    private static string FindSystemNode()
    {
        string pathValue = Environment.GetEnvironmentVariable("PATH") ?? string.Empty;
        foreach (string directory in pathValue.Split(Path.PathSeparator))
        {
            if (string.IsNullOrWhiteSpace(directory))
            {
                continue;
            }

            string candidate = Path.Combine(directory.Trim(), "node.exe");
            if (File.Exists(candidate))
            {
                return candidate;
            }
        }

        return string.Empty;
    }

    private static bool IsCompatibleNode(string nodeExe)
    {
        try
        {
            ProcessStartInfo startInfo = new ProcessStartInfo
            {
                FileName = nodeExe,
                Arguments = "--version",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };
            using (Process process = Process.Start(startInfo))
            {
                if (process == null)
                {
                    return false;
                }

                string version = process.StandardOutput.ReadToEnd().Trim();
                process.WaitForExit(3000);
                if (!version.StartsWith("v", StringComparison.OrdinalIgnoreCase))
                {
                    return false;
                }

                int major;
                return int.TryParse(version.Substring(1).Split('.')[0], out major) && major >= 24;
            }
        }
        catch
        {
            return false;
        }
    }

    private static void DownloadFile(string url, string destinationPath)
    {
        string tempPath = destinationPath + ".tmp";
        if (File.Exists(tempPath))
        {
            File.Delete(tempPath);
        }

        using (WebClient client = new WebClient())
        {
            client.DownloadFile(url, tempPath);
        }

        if (File.Exists(destinationPath))
        {
            File.Delete(destinationPath);
        }
        File.Move(tempPath, destinationPath);
    }

    private static bool VerifyArchiveChecksum(string downloadsDir, string archivePath, string archiveName)
    {
        string shasumsPath = Path.Combine(downloadsDir, "SHASUMS256.txt");
        if (!File.Exists(shasumsPath))
        {
            DownloadFile(NodeDistBaseUrl + "/SHASUMS256.txt", shasumsPath);
        }

        string expected = File
            .ReadLines(shasumsPath)
            .Where(line => line.EndsWith(" " + archiveName, StringComparison.Ordinal))
            .Select(line => line.Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries).FirstOrDefault())
            .FirstOrDefault();

        if (string.IsNullOrEmpty(expected))
        {
            return false;
        }

        using (SHA256 sha = SHA256.Create())
        using (FileStream stream = File.OpenRead(archivePath))
        {
            string actual = BitConverter.ToString(sha.ComputeHash(stream)).Replace("-", "").ToLowerInvariant();
            return string.Equals(expected, actual, StringComparison.OrdinalIgnoreCase);
        }
    }

    private static string GetWindowsRuntimeKey()
    {
        Architecture architecture = RuntimeInformation.OSArchitecture;
        return architecture == Architecture.Arm64 ? "win-arm64" : "win-x64";
    }

    private static string FindNodeExeUnder(string basePath)
    {
        if (!Directory.Exists(basePath))
        {
            return string.Empty;
        }

        string[] directCandidates =
        {
            Path.Combine(basePath, "node.exe"),
            Path.Combine(basePath, "node", "node.exe"),
            Path.Combine(basePath, "node", "bin", "node.exe")
        };

        string direct = directCandidates.FirstOrDefault(File.Exists);
        if (!string.IsNullOrEmpty(direct))
        {
            return direct;
        }

        return Directory
            .EnumerateFiles(basePath, "node.exe", SearchOption.AllDirectories)
            .FirstOrDefault() ?? string.Empty;
    }

    private static void StartServer(string root, string nodeExe, string serverScript)
    {
        ProcessStartInfo startInfo = new ProcessStartInfo
        {
            FileName = nodeExe,
            Arguments = "\"" + serverScript + "\"",
            WorkingDirectory = root,
            UseShellExecute = false,
            CreateNoWindow = true
        };
        startInfo.EnvironmentVariables["OFFER_DASHBOARD_AUTO_SHUTDOWN"] = "1";
        Process.Start(startInfo);
        Log("Spawned node server process");
    }

    private static bool IsHealthy(string root)
    {
        try
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(HealthUrl);
            request.Method = "GET";
            request.Timeout = 2000;
            using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
            {
                string cors = response.Headers["Access-Control-Allow-Origin"];
                if (response.StatusCode != HttpStatusCode.OK || cors != "*")
                {
                    return false;
                }

                using (StreamReader reader = new StreamReader(response.GetResponseStream()))
                {
                    string body = reader.ReadToEnd();
                    string remoteRoot = ExtractJsonString(body, "projectRoot");
                    return !string.IsNullOrEmpty(remoteRoot)
                        && NormalizePath(remoteRoot) == NormalizePath(root);
                }
            }
        }
        catch
        {
            return false;
        }
    }

    private static void StopProcessOnPort(int port)
    {
        try
        {
            ProcessStartInfo startInfo = new ProcessStartInfo
            {
                FileName = "netstat.exe",
                Arguments = "-ano -p tcp",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };
            using (Process process = Process.Start(startInfo))
            {
                if (process == null)
                {
                    return;
                }

                string output = process.StandardOutput.ReadToEnd();
                process.WaitForExit(5000);
                foreach (string line in output.Split(new[] { "\r\n", "\n" }, StringSplitOptions.RemoveEmptyEntries))
                {
                    if (line.IndexOf("LISTENING", StringComparison.OrdinalIgnoreCase) < 0)
                    {
                        continue;
                    }

                    if (line.IndexOf("127.0.0.1:" + port, StringComparison.OrdinalIgnoreCase) < 0)
                    {
                        continue;
                    }

                    string[] parts = line.Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
                    int pid;
                    if (parts.Length > 0 && int.TryParse(parts[parts.Length - 1], out pid))
                    {
                        Process.GetProcessById(pid).Kill();
                        Log("Stopped existing process on port " + port + " (PID " + pid + ")");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Log("Failed to stop process on port " + port + ": " + ex.Message);
        }
    }

    private static void WaitForHealthyServer(string root)
    {
        for (int i = 0; i < HealthAttempts; i++)
        {
            if (IsHealthy(root))
            {
                Log("Health check passed");
                return;
            }
            Thread.Sleep(HealthDelayMs);
        }
        Log("Health check did not pass within launcher wait window");
    }

    private static string ExtractJsonString(string json, string propertyName)
    {
        Match match = Regex.Match(
            json,
            "\"" + Regex.Escape(propertyName) + "\"\\s*:\\s*\"((?:\\\\.|[^\"])*)\""
        );
        if (!match.Success)
        {
            return string.Empty;
        }

        return match.Groups[1].Value
            .Replace("\\\\", "\\")
            .Replace("\\/", "/")
            .Replace("\\\"", "\"");
    }

    private static string NormalizePath(string pathValue)
    {
        try
        {
            return Path.GetFullPath(pathValue).TrimEnd('\\', '/').ToLowerInvariant();
        }
        catch
        {
            return pathValue ?? string.Empty;
        }
    }

    private static void Log(string message)
    {
        try
        {
            if (string.IsNullOrEmpty(_launcherLogPath))
            {
                return;
            }

            File.AppendAllText(
                _launcherLogPath,
                string.Format("[{0}] {1}{2}", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"), message, Environment.NewLine)
            );
        }
        catch
        {
        }
    }
}
