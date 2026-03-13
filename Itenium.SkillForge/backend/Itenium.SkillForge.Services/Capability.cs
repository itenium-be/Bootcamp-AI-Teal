namespace Itenium.SkillForge.Services;

/// <summary>
/// Fine-grained capabilities for the SkillForge application.
/// Configure role-capability mappings in appsettings.json.
/// </summary>
public enum Capability
{
    ReadCourse,
    ManageCourse,

    ReadSkills,
    ManageSkills,

    ReadGoals,
    ManageGoals,
    ValidateGoal,

    ReadResources,
    ManageResources,

    ReadCoachDashboard,
}
