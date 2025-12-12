using System.Xml.Linq;

namespace BuildScripts.Shared;

/// <summary>
/// Git-related utility functions
/// </summary>
public static class GitUtils
{
    /// <summary>
    /// Find git repository root by looking for .git directory
    /// </summary>
    /// <param name="startPath">Path to start searching from</param>
    /// <returns>Absolute path to git root</returns>
    /// <exception cref="DirectoryNotFoundException">If git root not found</exception>
    public static string FindGitRoot(string? startPath = null)
    {
        var currentPath = startPath ?? Directory.GetCurrentDirectory();
        
        while (true)
        {
            if (Directory.Exists(Path.Combine(currentPath, ".git")))
            {
                return currentPath;
            }
            
            var parentPath = Directory.GetParent(currentPath)?.FullName;
            if (parentPath == null || parentPath == currentPath)
            {
                throw new DirectoryNotFoundException("Git root not found - not in a git repository?");
            }
            
            currentPath = parentPath;
        }
    }
}
