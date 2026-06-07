using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

internal static class Program
{
    private const string HealthUrl = "http://127.0.0.1:4782/api/health";
    private const int HealthAttempts = 30;
    private const int HealthDelayMs = 300;
    private const string NodeVersion = "24.14.0";
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
                throw new FileNotFoundException("启动页面不存在。", launchPage);
            }

            if (!File.Exists(serverScript))
            {
                throw new FileNotFoundException("服务脚本不存在。", serverScript);
            }

            string nodeExe = ResolveNodeExe(root);
            Log("Using Node runtime " + nodeExe);
            if (!IsHealthy())
            {
                Log("Health check failed, starting local server");
                StartServer(root, nodeExe, serverScript);
            }
            else
            {
                Log("Existing local server is already healthy");
            }

            Process.Start(new ProcessStartInfo
            {
                FileName = launchPage,
                UseShellExecute = true
            });
            Log("Opened launching page " + launchPage);

            WaitForHealthyServer();
            Log("Launcher finished");
        }
        catch (Exception ex)
        {
            Log("Launcher failed: " + ex);
            MessageBox.Show(
                "Offer Dashboard 启动失败。\r\n\r\n" + ex.Message,
                "Offer Dashboard",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error
            );
        }
    }

    private static string ResolveNodeExe(string root)
    {
        string runtimeKey = GetWindowsRuntimeKey();
        string runtimeDir = Path.Combine(root, "runtime");
        string packagePath = Path.Combine(runtimeDir, "packages", string.Format("node-v{0}-{1}.zip", NodeVersion, runtimeKey));
        string targetDir = Path.Combine(runtimeDir, runtimeKey);

        string existing = FindNodeExeUnder(targetDir);
        if (!string.IsNullOrEmpty(existing))
        {
            return existing;
        }

        if (!File.Exists(packagePath))
        {
            throw new FileNotFoundException("未找到内置 Node 运行时压缩包。", packagePath);
        }

        Directory.CreateDirectory(targetDir);
        Log("Extracting bundled runtime from " + packagePath);
        ZipFile.ExtractToDirectory(packagePath, targetDir);

        string extracted = FindNodeExeUnder(targetDir);
        if (!string.IsNullOrEmpty(extracted))
        {
            return extracted;
        }

        throw new FileNotFoundException("解压后仍未找到 node.exe。", targetDir);
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
        Process.Start(new ProcessStartInfo
        {
            FileName = nodeExe,
            Arguments = "\"" + serverScript + "\"",
            WorkingDirectory = root,
            UseShellExecute = true,
            WindowStyle = ProcessWindowStyle.Hidden
        });
        Log("Spawned node server process");
    }

    private static bool IsHealthy()
    {
        try
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(HealthUrl);
            request.Method = "GET";
            request.Timeout = 2000;
            using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
            {
                string cors = response.Headers["Access-Control-Allow-Origin"];
                return response.StatusCode == HttpStatusCode.OK && cors == "*";
            }
        }
        catch
        {
            return false;
        }
    }

    private static void WaitForHealthyServer()
    {
        for (int i = 0; i < HealthAttempts; i++)
        {
            if (IsHealthy())
            {
                Log("Health check passed");
                return;
            }
            Thread.Sleep(HealthDelayMs);
        }
        Log("Health check did not pass within launcher wait window");
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
