using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trendify.Modules.Accounts.Domain;

namespace Trendify.Modules.Accounts.Infrastructure;

internal sealed class WorkspaceConfiguration : IEntityTypeConfiguration<Workspace>
{
    public void Configure(EntityTypeBuilder<Workspace> builder)
    {
        builder.ToTable("workspaces");
        builder.HasKey(w => w.Id);
        builder.Property(w => w.Name).HasMaxLength(255).IsRequired();
        builder.Property(w => w.Slug).HasMaxLength(100).IsRequired();
        builder.HasIndex(w => w.Slug).IsUnique();
        builder.Property(w => w.Plan).HasMaxLength(50).HasDefaultValue("free");
    }
}

internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Email).HasMaxLength(255).IsRequired();
        builder.HasIndex(u => u.Email).IsUnique()
            .HasFilter("deleted_at IS NULL");
        builder.Property(u => u.PasswordHash).HasMaxLength(255).IsRequired();
        builder.Property(u => u.DisplayName).HasMaxLength(255);
        builder.Property(u => u.Role).HasMaxLength(50).HasDefaultValue("owner");
        builder.HasIndex(u => u.TenantId);
    }
}

internal sealed class SocialAccountConfiguration : IEntityTypeConfiguration<SocialAccount>
{
    public void Configure(EntityTypeBuilder<SocialAccount> builder)
    {
        builder.ToTable("social_accounts");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Platform).HasMaxLength(50).IsRequired();
        builder.Property(a => a.PlatformUserId).HasMaxLength(255).IsRequired();
        builder.Property(a => a.Username).HasMaxLength(255).IsRequired();
        builder.Property(a => a.DisplayName).HasMaxLength(255);
        builder.Property(a => a.Status).HasMaxLength(50).HasDefaultValue("active");
        builder.HasIndex(a => a.TenantId);
        builder.HasIndex(a => new { a.TenantId, a.Platform, a.PlatformUserId }).IsUnique()
            .HasFilter("deleted_at IS NULL");
    }
}

internal sealed class AccountGroupConfiguration : IEntityTypeConfiguration<AccountGroup>
{
    public void Configure(EntityTypeBuilder<AccountGroup> builder)
    {
        builder.ToTable("account_groups");
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Name).HasMaxLength(255).IsRequired();
        builder.HasMany(g => g.Members).WithOne()
            .HasForeignKey(m => m.GroupId);
        builder.HasIndex(g => g.TenantId);
    }
}

internal sealed class AccountGroupMemberConfiguration : IEntityTypeConfiguration<AccountGroupMember>
{
    public void Configure(EntityTypeBuilder<AccountGroupMember> builder)
    {
        builder.ToTable("account_group_members");
        builder.HasKey(m => new { m.GroupId, m.SocialAccountId });
    }
}
