# Build Scripts (C#)

Shared build and utility scripts for the TimeToDo project using C# for type safety and better XML/SVG handling.

## Requirements

- .NET 10 SDK or later

No additional tools needed! Uses native `dotnet run` support for C# scripts.

## Structure

```
scripts/
  Shared/           ← Reusable utility classes (optional, for future use)
    GitUtils.cs     
    SvgUtils.cs     
  Icons/            ← Icon-related build scripts
    BuildFrontendIcons.cs  ← Self-contained script with top-level statements
```

## Usage

### Build Frontend Icons

Generates `core-icons.ts` from `/assets/icons/*.svg`:

```bash
dotnet run scripts/Icons/BuildFrontendIcons.cs
```

Or add to your package.json:
```json
{
  "scripts": {
    "build:icons": "dotnet run scripts/Icons/BuildFrontendIcons.cs"
  }
}
```

## Why C# Scripts?

- ✅ **Type safety** - Catch errors at compile time
- ✅ **IntelliSense** - IDE support for autocomplete and refactoring
- ✅ **XML built-in** - System.Xml.Linq for proper SVG parsing
- ✅ **LINQ** - Query and transform data easily
- ✅ **Shared language** - Same as backend (.NET)
- ✅ **Better tooling** - Easier to maintain and extend

## Shared Utilities

### GitUtils.cs

- `FindGitRoot(startPath)` - Find git repository root

### SvgUtils.cs

- `NormalizeSvg(svg, removeUnnecessaryAttributes)` - Parse, clean, and minify SVG using XDocument
- `ValidateSvg(svg, filename)` - Security validation (no scripts, event handlers, etc.)
- `EscapeSvgForJs(svg)` - Escape for JavaScript template literals

## Adding New Scripts

1. Create your script as `.csx` file
2. Use `#load` to import shared utilities:
   ```csharp
   #load "../Shared/GitUtils.cs"
   #load "../Shared/SvgUtils.cs"
   ```
3. Use the utilities:
   ```csharp
   var gitRoot = GitUtils.FindGitRoot();
   var svg = SvgUtils.NormalizeSvg(content);
   ```

## XML/SVG Advantages in C#

Unlike JavaScript regex manipulation, C# provides proper XML parsing:

```csharp
var doc = XDocument.Parse(svgContent);

// Remove attributes
doc.Root?.Attribute("id")?.Remove();

// Query elements
var paths = doc.Descendants()
    .Where(e => e.Name.LocalName == "path");

// Validate structure
if (doc.Descendants().Any(e => e.Name.LocalName == "script"))
    throw new Exception("Scripts not allowed");
```

Much safer and more maintainable than string manipulation!
