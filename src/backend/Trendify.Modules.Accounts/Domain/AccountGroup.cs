using Trendify.Shared.Domain;

namespace Trendify.Modules.Accounts.Domain;

public sealed class AccountGroup : TenantEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    private readonly List<AccountGroupMember> _members = [];
    public IReadOnlyList<AccountGroupMember> Members => _members.AsReadOnly();

    private AccountGroup() { }

    public static AccountGroup Create(Guid tenantId, string name, string? description = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        return new AccountGroup
        {
            TenantId = tenantId,
            Name = name.Trim(),
            Description = description?.Trim()
        };
    }

    public void AddMember(Guid socialAccountId)
    {
        if (_members.Any(m => m.SocialAccountId == socialAccountId)) return;
        _members.Add(new AccountGroupMember(Id, socialAccountId));
        MarkUpdated();
    }

    public void RemoveMember(Guid socialAccountId)
    {
        var member = _members.FirstOrDefault(m => m.SocialAccountId == socialAccountId);
        if (member is not null)
        {
            _members.Remove(member);
            MarkUpdated();
        }
    }

    public void Update(string name, string? description)
    {
        Name = name.Trim();
        Description = description?.Trim();
        MarkUpdated();
    }
}

public sealed class AccountGroupMember
{
    public Guid GroupId { get; private set; }
    public Guid SocialAccountId { get; private set; }

    private AccountGroupMember() { }

    public AccountGroupMember(Guid groupId, Guid socialAccountId)
    {
        GroupId = groupId;
        SocialAccountId = socialAccountId;
    }
}
