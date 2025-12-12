<#
.SYNOPSIS
    Find CSS variables that are used but never declared.

.DESCRIPTION
    Scans all code files to find:
    1. All CSS variable declarations (--var-name: value)
    2. All CSS variable usages (var(--var-name) or var(--var-name, fallback))

    Then reports variables that are used but never declared.
    These are the cases where fallback values are actually being used!

.EXAMPLE
    .\find-undeclared-css-vars.ps1

.EXAMPLE
    .\find-undeclared-css-vars.ps1 -ShowAllUsages

.EXAMPLE
    .\find-undeclared-css-vars.ps1 -OutputFormat json > undeclared.json
#>

param(
    [switch]$ShowAllUsages,
    [switch]$IncludeDeclaredButUnused,
    [ValidateSet('table', 'json', 'list')]
    [string]$OutputFormat = 'table'
)

$ErrorActionPreference = 'Stop'

# Get the repository root (two levels up from scripts/css)
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '../..')

# Directories to exclude
$excludeDirs = @(
    'node_modules',
    'dist',
    'tmp',
    '.git',
    '.nx',
    '.angular',
    'coverage'
)

# File extensions to search
$includeExtensions = @(
    '*.css',
    '*.scss',
    '*.sass',
    '*.less',
    '*.ts',
    '*.tsx',
    '*.js',
    '*.jsx',
    '*.html',
    '*.vue',
    '*.svelte'
)

# Regex patterns
# Declaration: --var-name: value (but not inside var())
$declarationRegex = '(?<!var\s*\(\s*)(--[\w-]+)\s*:'
# Usage: var(--var-name) or var(--var-name, fallback)
$usageRegex = 'var\s*\(\s*(--[\w-]+)'

Write-Host "🔍 Scanning for CSS variable declarations and usages..." -ForegroundColor Cyan
Write-Host "   Root: $repoRoot" -ForegroundColor Gray

# Collect declarations and usages
$declarations = @{}  # variable -> list of locations
$usages = @{}        # variable -> list of {File, Line, HasFallback, Fallback}

# Helper to check if path should be excluded
function Test-ExcludedPath {
    param($path)
    foreach ($dir in $excludeDirs) {
        if ($path -match "[\\/]$dir[\\/]") {
            return $true
        }
    }
    return $false
}

# Scan files
$fileCount = 0
foreach ($ext in $includeExtensions) {
    $files = Get-ChildItem -Path $repoRoot -Filter $ext -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { -not (Test-ExcludedPath $_.FullName) }

    foreach ($file in $files) {
        $fileCount++
        $relativePath = $file.FullName.Substring($repoRoot.Path.Length + 1)
        $lineNum = 0

        Get-Content $file.FullName -ErrorAction SilentlyContinue | ForEach-Object {
            $lineNum++
            $line = $_

            # Skip comments
            if ($line -match '^\s*(//|/\*|\*)') {
                return
            }

            # Find declarations
            $declMatches = [regex]::Matches($line, $declarationRegex)
            foreach ($match in $declMatches) {
                $varName = $match.Groups[1].Value
                if (-not $declarations.ContainsKey($varName)) {
                    $declarations[$varName] = @()
                }
                $declarations[$varName] += [PSCustomObject]@{
                    File = $relativePath
                    Line = $lineNum
                }
            }

            # Find usages (with or without fallback)
            $useMatches = [regex]::Matches($line, $usageRegex)
            foreach ($match in $useMatches) {
                $varName = $match.Groups[1].Value

                # Check if this usage has a fallback
                $hasFallback = $false
                $fallbackValue = $null
                $fullMatch = $line.Substring($match.Index)
                if ($fullMatch -match 'var\s*\(\s*--[\w-]+\s*,\s*([^)]+)\)') {
                    $hasFallback = $true
                    $fallbackValue = $matches[1].Trim()
                }

                if (-not $usages.ContainsKey($varName)) {
                    $usages[$varName] = @()
                }
                $usages[$varName] += [PSCustomObject]@{
                    File        = $relativePath
                    Line        = $lineNum
                    HasFallback = $hasFallback
                    Fallback    = $fallbackValue
                }
            }
        }
    }
}

Write-Host "   Scanned $fileCount files" -ForegroundColor Gray
Write-Host "`n📊 Results:" -ForegroundColor Green
Write-Host "   Declared variables: $($declarations.Count)" -ForegroundColor White
Write-Host "   Used variables: $($usages.Count)" -ForegroundColor White

# Find undeclared variables (used but not declared)
$undeclared = @{}
foreach ($varName in $usages.Keys) {
    if (-not $declarations.ContainsKey($varName)) {
        $undeclared[$varName] = $usages[$varName]
    }
}

# Find unused variables (declared but not used) - optional
$unused = @{}
if ($IncludeDeclaredButUnused) {
    foreach ($varName in $declarations.Keys) {
        if (-not $usages.ContainsKey($varName)) {
            $unused[$varName] = $declarations[$varName]
        }
    }
}

# Report undeclared variables
if ($undeclared.Count -eq 0) {
    Write-Host "`n✅ All used variables are declared!" -ForegroundColor Green
}
else {
    Write-Host "`n⚠️  Found $($undeclared.Count) UNDECLARED variables (fallbacks are being used!):" -ForegroundColor Yellow

    # Sort by usage count
    $sortedUndeclared = $undeclared.GetEnumerator() | Sort-Object { $_.Value.Count } -Descending

    switch ($OutputFormat) {
        'json' {
            $output = @{}
            foreach ($entry in $sortedUndeclared) {
                $output[$entry.Key] = @{
                    UsageCount = $entry.Value.Count
                    Usages = $entry.Value | ForEach-Object {
                        @{
                            File = $_.File
                            Line = $_.Line
                            HasFallback = $_.HasFallback
                            Fallback = $_.Fallback
                        }
                    }
                }
            }
            $output | ConvertTo-Json -Depth 4
        }
        'list' {
            foreach ($entry in $sortedUndeclared) {
                Write-Host "`n  $($entry.Key)" -ForegroundColor Red
                Write-Host "    Used $($entry.Value.Count) time(s)" -ForegroundColor Gray

                # Get unique fallbacks
                $fallbacks = $entry.Value | Where-Object { $_.HasFallback } | Select-Object -ExpandProperty Fallback -Unique
                if ($fallbacks) {
                    Write-Host "    Fallback(s): $($fallbacks -join ', ')" -ForegroundColor DarkYellow
                }

                if ($ShowAllUsages) {
                    foreach ($usage in $entry.Value) {
                        $fb = if ($usage.HasFallback) { " [fallback: $($usage.Fallback)]" } else { " [NO FALLBACK!]" }
                        Write-Host "      $($usage.File):$($usage.Line)$fb" -ForegroundColor DarkGray
                    }
                }
            }
        }
        'table' {
            Write-Host ""
            $tableData = foreach ($entry in $sortedUndeclared) {
                $fallbacks = ($entry.Value | Where-Object { $_.HasFallback } | Select-Object -ExpandProperty Fallback -Unique) -join '; '
                $noFallbackCount = ($entry.Value | Where-Object { -not $_.HasFallback }).Count

                [PSCustomObject]@{
                    Variable     = $entry.Key
                    Usages       = $entry.Value.Count
                    NoFallback   = $noFallbackCount
                    Fallbacks    = if ($fallbacks.Length -gt 50) { $fallbacks.Substring(0, 47) + '...' } else { $fallbacks }
                }
            }
            $tableData | Format-Table -AutoSize
        }
    }
}

# Report unused variables if requested
if ($IncludeDeclaredButUnused -and $unused.Count -gt 0) {
    Write-Host "`n📋 Declared but never used ($($unused.Count) variables):" -ForegroundColor Cyan
    foreach ($entry in ($unused.GetEnumerator() | Sort-Object Key)) {
        Write-Host "  $($entry.Key)" -ForegroundColor DarkGray
        foreach ($loc in $entry.Value) {
            Write-Host "    $($loc.File):$($loc.Line)" -ForegroundColor DarkGray
        }
    }
}

# Summary with action items
Write-Host "`n" + "=" * 60 -ForegroundColor DarkGray
Write-Host "📋 Summary:" -ForegroundColor Cyan

$criticalCount = ($undeclared.Values | ForEach-Object { $_ | Where-Object { -not $_.HasFallback } } | Measure-Object).Count

Write-Host "   Undeclared variables: $($undeclared.Count)" -ForegroundColor $(if ($undeclared.Count -gt 0) { 'Yellow' } else { 'Green' })
Write-Host "   Usages without fallback: $criticalCount" -ForegroundColor $(if ($criticalCount -gt 0) { 'Red' } else { 'Green' })

if ($undeclared.Count -gt 0) {
    Write-Host "`n💡 Actions needed:" -ForegroundColor Cyan
    Write-Host "   1. Define missing variables in your token files" -ForegroundColor White
    Write-Host "   2. Or remove fallbacks once variables are defined" -ForegroundColor White
    Write-Host "   3. Variables without fallbacks will show as 'invalid' in browser!" -ForegroundColor Yellow
}
