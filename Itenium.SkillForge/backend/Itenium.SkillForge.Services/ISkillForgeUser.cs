using Itenium.Forge.Security;

namespace Itenium.SkillForge.Services;

/// <summary>
/// Provides access to the current user.
/// </summary>
public interface ISkillForgeUser : ICurrentUser
{
    /// <summary>
    /// Gets a value indicating whether the current user is BackOffice management.
    /// </summary>
    bool IsBackOffice { get; }

    /// <summary>
    /// Gets a value indicating whether the current user is a Manager/Coach.
    /// </summary>
    bool IsManager { get; }

    /// <summary>
    /// Gets the IDs of the Teams the user has access to.
    /// </summary>
    ICollection<int> Teams { get; }
}
