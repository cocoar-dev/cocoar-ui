<#
.SYNOPSIS
    Find all CSS variable usages with fallbacks in the codebase.

.DESCRIPTION
    Scans all code files (excluding node_modules, dist, tmp) for CSS variables
    that have fallback values: var(--something, fallback-value)

    This helps identify:
    - Inconsistent fallback values for the same variable
    - Variables that might not be defined
    - Hardcoded values that should use tokens

.EXAMPLE
    .\find-css-fallbacks.ps1

.EXAMPLE
    .\find-css-fallbacks.ps1 -GroupByVariable

.EXAMPLE
    .\find-css-fallbacks.ps1 -OutputFormat json > fallbacks.json
#>

param(
    [switch]$GroupByVariable,
    [ValidateSet('table', 'json', 'csv')]
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

# Regex to match var(--something, fallback)
# Captures: 1=variable name, 2=fallback value
$fallbackRegex = 'var\s*\(\s*(--[\w-]+)\s*,\s*([^)]+)\)'

Write-Host "🔍 Scanning for CSS variable fallbacks..." -ForegroundColor Cyan
Write-Host "   Root: $repoRoot" -ForegroundColor Gray

# Build exclusion pattern for Get-ChildItem
$excludePattern = $excludeDirs | ForEach-Object { "*\$_\*" }

# Collect all results
$results = @()

foreach ($ext in $includeExtensions) {
    $files = Get-ChildItem -Path $repoRoot -Filter $ext -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object {
            $path = $_.FullName
            -not ($excludeDirs | Where-Object { $path -match "[\\/]$_[\\/]" })
        }

    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($repoRoot.Path.Length + 1)
        $lineNum = 0

        Get-Content $file.FullName -ErrorAction SilentlyContinue | ForEach-Object {
            $lineNum++
            $line = $_

            # Find all matches on this line
            $matches = [regex]::Matches($line, $fallbackRegex)

            foreach ($match in $matches) {
                $variable = $match.Groups[1].Value
                $fallback = $match.Groups[2].Value.Trim()

                $results += [PSCustomObject]@{
                    File      = $relativePath
                    Line      = $lineNum
                    Variable  = $variable
                    Fallback  = $fallback
                    Context   = $line.Trim().Substring(0, [Math]::Min(80, $line.Trim().Length))
                }
            }
        }
    }
}

Write-Host "`n📊 Found $($results.Count) CSS variable fallbacks" -ForegroundColor Green

if ($results.Count -eq 0) {
    Write-Host "   No fallbacks found!" -ForegroundColor Yellow
    exit 0
}

# Group by variable if requested
if ($GroupByVariable) {
    $grouped = $results | Group-Object -Property Variable | Sort-Object Count -Descending

    Write-Host "`n📋 Variables with fallbacks (grouped):`n" -ForegroundColor Cyan

    foreach ($group in $grouped) {
        $uniqueFallbacks = $group.Group | Select-Object -ExpandProperty Fallback -Unique
        $fallbackCount = $uniqueFallbacks.Count

        # Highlight variables with inconsistent fallbacks
        $color = if ($fallbackCount -gt 1) { 'Yellow' } else { 'White' }

        Write-Host "  $($group.Name)" -ForegroundColor $color -NoNewline
        Write-Host " ($($group.Count) usages, $fallbackCount unique fallback(s))" -ForegroundColor Gray

        if ($fallbackCount -gt 1) {
            Write-Host "    ⚠️  Inconsistent fallbacks:" -ForegroundColor Yellow
            foreach ($fb in $uniqueFallbacks) {
                Write-Host "       - $fb" -ForegroundColor DarkYellow
            }
        }

        foreach ($item in $group.Group) {
            Write-Host "       $($item.File):$($item.Line)" -ForegroundColor DarkGray
        }
        Write-Host ""
    }
}
else {
    # Output based on format
    switch ($OutputFormat) {
        'json' {
            $results | ConvertTo-Json -Depth 3
        }
        'csv' {
            $results | ConvertTo-Csv -NoTypeInformation
        }
        'table' {
            Write-Host ""
            $results | Format-Table -AutoSize -Property @(
                @{Label='Variable'; Expression={$_.Variable}; Width=40},
                @{Label='Fallback'; Expression={$_.Fallback}; Width=30},
                @{Label='Location'; Expression={"$($_.File):$($_.Line)"}}
            )
        }
    }
}

# Summary statistics
Write-Host "`n📈 Summary:" -ForegroundColor Cyan
$uniqueVars = $results | Select-Object -ExpandProperty Variable -Unique
Write-Host "   Total fallbacks found: $($results.Count)" -ForegroundColor White
Write-Host "   Unique variables: $($uniqueVars.Count)" -ForegroundColor White

# Find variables with inconsistent fallbacks
$inconsistent = $results |
    Group-Object Variable |
    Where-Object { ($_.Group | Select-Object -ExpandProperty Fallback -Unique).Count -gt 1 }

if ($inconsistent.Count -gt 0) {
    Write-Host "   ⚠️  Variables with inconsistent fallbacks: $($inconsistent.Count)" -ForegroundColor Yellow
    foreach ($var in $inconsistent) {
        Write-Host "      - $($var.Name)" -ForegroundColor DarkYellow
    }
}
