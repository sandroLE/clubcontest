using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SampleMvcApp.DataModels;

namespace SampleMvcApp.Database
{

	public class DatabaseContext : DbContext
	{
		public DatabaseContext(DbContextOptions options) : base(options)
		{
		}

		protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
		{
			base.OnConfiguring(optionsBuilder);
			optionsBuilder.EnableSensitiveDataLogging();
		}

		public DbSet<Competition> Competitions { get; set; }
		public DbSet<User> User { get; set; }
		public DbSet<Day> Days { get; set; }
		public DbSet<Flight> Flights { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{


			modelBuilder.Entity<Competition>().ToTable("CC_Competition");
			modelBuilder.Entity<User>().ToTable("CC_User");
			modelBuilder.Entity<Day>().ToTable("CC_Day");
			modelBuilder.Entity<Flight>().ToTable("CC_Flight");

			modelBuilder.Entity<Competition>()
				.Property(x => x.Id)
				.UseSqlServerIdentityColumn()
				.IsRequired();

			modelBuilder.Entity<Competition>()
				.Property(x => x.Name)
				.IsRequired();
			modelBuilder.Entity<Competition>()
				.Property(x => x.AdminUsers);

			modelBuilder.Entity<User>()
				.Property(x => x.Id)
				.UseSqlServerIdentityColumn()
				.IsRequired();

			modelBuilder.Entity<User>()
				.Property(x => x.Auth0Id)
				.IsRequired()
				.HasMaxLength(400);

			modelBuilder.Entity<User>()
				.Property(x => x.Name)
				.IsRequired();

			modelBuilder.Entity<User>()
				.HasMany(x => x.Competitions)
				.WithOne(x => x.Creator)
				.HasForeignKey(x => x.CreatorId);


			modelBuilder.Entity<Day>()
			.Property(x => x.Id)
			.UseSqlServerIdentityColumn()
			.IsRequired();

			modelBuilder.Entity<Day>()
				.Property(x => x.Date)
				.IsRequired();


			modelBuilder.Entity<Day>()
				.HasOne(d => d.Competition)
				.WithMany(c => c.Days)
				.HasForeignKey(d => d.CompetitionId);

			modelBuilder.Entity<Day>()
				.Ignore(x => x.XcSoarTask);


			modelBuilder.Entity<Flight>()
				.Property(x => x.Id)
				.UseSqlServerIdentityColumn()
				.IsRequired();

			modelBuilder.Entity<Flight>()
			.HasOne(f => f.Day)
			.WithMany(d => d.Flights)
			.HasForeignKey(f => f.DayId);

			modelBuilder.Entity<Flight>()
			.HasOne(f => f.User)
			.WithMany(d => d.Flights)
			.HasForeignKey(f => f.UserId);

			modelBuilder.Entity<Flight>()
				.Property(x => x.IgcFile)
				.IsRequired();

			modelBuilder.Entity<Flight>()
				.Ignore(x => x.Points);

			modelBuilder.Entity<Flight>()
				.Property(x => x.GliderType);
		

			modelBuilder.Entity<Flight>()
				.Property(x => x.Handicap)
				.IsRequired();
		}
	}
}
