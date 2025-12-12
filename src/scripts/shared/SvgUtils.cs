using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Linq;

namespace BuildScripts.Shared;

/// <summary>
/// SVG processing utilities
/// </summary>
public static class SvgUtils
{
    /// <summary>
    /// Normalize SVG content for production use
    /// </summary>
    /// <param name="svgContent">Raw SVG content</param>
    /// <param name="removeUnnecessaryAttributes">Remove id, version, etc.</param>
    /// <returns>Normalized and minified SVG</returns>
    public static string NormalizeSvg(string svgContent, bool removeUnnecessaryAttributes = true)
    {
        // Parse as XML
        var doc = XDocument.Parse(svgContent);
        
        if (removeUnnecessaryAttributes)
        {
            RemoveUnnecessaryAttributes(doc);
        }
        
        // Remove comments
        doc.DescendantNodes()
            .OfType<XComment>()
            .Remove();
        
        // Return minified (no formatting)
        return doc.ToString(SaveOptions.DisableFormatting);
    }
    
    /// <summary>
    /// Remove unnecessary attributes from SVG
    /// </summary>
    private static void RemoveUnnecessaryAttributes(XDocument doc)
    {
        var unnecessaryAttrs = new[] { "id", "version", "data-name" };
        
        foreach (var element in doc.Descendants())
        {
            foreach (var attrName in unnecessaryAttrs)
            {
                element.Attribute(attrName)?.Remove();
            }
        }
    }
    
    /// <summary>
    /// Validate SVG content for security issues
    /// </summary>
    /// <param name="svgContent">SVG content to validate</param>
    /// <param name="filename">Filename for error messages</param>
    /// <exception cref="InvalidOperationException">If dangerous content found</exception>
    public static void ValidateSvg(string svgContent, string filename)
    {
        var doc = XDocument.Parse(svgContent);
        
        // Check for script elements
        if (doc.Descendants().Any(e => e.Name.LocalName.Equals("script", StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException($"⚠️  Dangerous content found in {filename}: script tags");
        }
        
        // Check for foreignObject
        if (doc.Descendants().Any(e => e.Name.LocalName.Equals("foreignObject", StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException($"⚠️  Dangerous content found in {filename}: foreignObject elements");
        }
        
        // Check for event handlers in attributes
        var allAttributes = doc.Descendants().SelectMany(e => e.Attributes());
        if (allAttributes.Any(a => a.Name.LocalName.StartsWith("on", StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException($"⚠️  Dangerous content found in {filename}: event handlers");
        }
        
        // Check for javascript: URIs
        if (Regex.IsMatch(svgContent, @"javascript:", RegexOptions.IgnoreCase))
        {
            throw new InvalidOperationException($"⚠️  Dangerous content found in {filename}: javascript: URIs");
        }
        
        // Check for @import
        if (svgContent.Contains("@import", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"⚠️  Dangerous content found in {filename}: CSS @import");
        }
    }
    
    /// <summary>
    /// Escape SVG content for use in JavaScript/TypeScript template literals
    /// </summary>
    /// <param name="svg">SVG content</param>
    /// <returns>Escaped SVG safe for template literals</returns>
    public static string EscapeSvgForJs(string svg)
    {
        return svg
            .Replace("\\", "\\\\")
            .Replace("`", "\\`")
            .Replace("$", "\\$");
    }
}
