using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Trendify.Infrastructure.Outbox;

public sealed class OutboxMessageConfiguration : IEntityTypeConfiguration<OutboxMessage>
{
    public void Configure(EntityTypeBuilder<OutboxMessage> b)
    {
        b.ToTable("outbox_messages");

        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id");
        b.Property(x => x.TenantId).HasColumnName("tenant_id").IsRequired();
        b.Property(x => x.Type).HasColumnName("type").HasMaxLength(500).IsRequired();
        b.Property(x => x.Data).HasColumnName("data").IsRequired();
        b.Property(x => x.OccurredAt).HasColumnName("occurred_at").IsRequired();
        b.Property(x => x.ProcessedAt).HasColumnName("processed_at");
        b.Property(x => x.Error).HasColumnName("error").HasMaxLength(2000);

        b.HasIndex(x => x.ProcessedAt);
        b.HasIndex(x => new { x.TenantId, x.OccurredAt });
    }
}
