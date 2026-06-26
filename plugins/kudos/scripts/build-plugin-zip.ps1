# build-plugin-zip.ps1 - package the plugin into dist/kudos.zip for the Cowork
# "Upload local plugin" dialog. The zip root contains .claude-plugin/plugin.json + skills/ etc.
# Uses explicit forward-slash entry names (Windows PowerShell's Compress-Archive writes
# backslashes, which the uploader rejects). Author-side build step (Windows).
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem | Out-Null

# repo root = scripts\..\..\..  (scripts -> kudos -> plugins -> repo)
$pluginDir = Split-Path -Parent $PSScriptRoot          # plugins\kudos
$repoRoot  = Split-Path -Parent (Split-Path -Parent $pluginDir)
$dist      = Join-Path $repoRoot 'dist'
$zip       = Join-Path $dist 'kudos.zip'
New-Item -ItemType Directory -Force -Path $dist | Out-Null
if (Test-Path $zip) { Remove-Item $zip -Force }

$fs = [System.IO.File]::Open($zip, [System.IO.FileMode]::CreateNew)
$archive = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  Get-ChildItem $pluginDir -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($pluginDir.Length + 1).Replace('\', '/')
    $entry = $archive.CreateEntry($rel, [System.IO.Compression.CompressionLevel]::Optimal)
    $stream = $entry.Open()
    $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Dispose()
  }
} finally { $archive.Dispose(); $fs.Dispose() }
Write-Host "Built $zip"
