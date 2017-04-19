using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using SampleMvcApp.Database;
using SampleMvcApp.DataModels;

namespace SampleMvcApp.Extensions
{
	public static class UserExtension
	{
		public static string GetId(this ClaimsPrincipal user)
		{
			return user.Claims.FirstOrDefault(x => x.Type == "user_id")?.Value;
		}

		public static int GetDbId(this ClaimsPrincipal user, DatabaseContext db)
		{
			const int unauthorizedUser = 1;
			return db.User.FirstOrDefault(x => x.Auth0Id == user.GetId())?.Id ?? unauthorizedUser;
		}

		public static bool IsAdminUser(this ClaimsPrincipal user, Competition competition, DatabaseContext db)
		{
			if (user.GetDbId(db) == competition.CreatorId)
			{
				return true;
			}

			if (string.IsNullOrWhiteSpace(competition.AdminUsers))
			{
				return false;
			}

			var adminAddresses = competition.AdminUsers.Split(',').Select(x => x.Trim());
			return adminAddresses.Contains(user.GetEmail());
		}

		public static string GetEmail(this ClaimsPrincipal user)
		{
			return user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
		}

	}
}
