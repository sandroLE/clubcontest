using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.Authentication;
using Microsoft.AspNetCore.Authorization;
using SampleMvcApp.Database;
using SampleMvcApp.Extensions;
using SampleMvcApp.ViewModels;

namespace SampleMvcApp.Controllers
{
	public class AccountController : Controller
	{
		private readonly DatabaseContext _dbContext;

		public AccountController(DatabaseContext dbContext)
		{
			_dbContext = dbContext;
		}
		public IActionResult Login(string returnUrl = "/")
		{
			return new ChallengeResult("Auth0", new AuthenticationProperties() { RedirectUri = returnUrl });
		}

#if !DEBUG
		[Authorize] 
#endif
		public IActionResult Logout()
		{
			HttpContext.Authentication.SignOutAsync("Auth0");
			HttpContext.Authentication.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

			return RedirectToAction("New", "Competition");
		}

#if !DEBUG
		[Authorize] 
#endif
		public IActionResult Profile()
		{
			return View(new UserProfileViewModel()
			{
				Name = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value,
				EmailAddress = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value,
				ProfileImage = User.Claims.FirstOrDefault(c => c.Type == "picture")?.Value
			});
		}

		/// <summary>
		/// This is just a helper action to enable you to easily see all claims related to a user. It helps when debugging your
		/// application to see the in claims populated from the Auth0 ID Token
		/// </summary>
		/// <returns></returns>
#if !DEBUG
		[Authorize] 
#endif
		public IActionResult Claims()
		{
			return View();
		}

#if !DEBUG
		[Authorize] 
#endif
		public IActionResult Settings()
		{
			var currentUser = _dbContext.User.FirstOrDefault(x => x.Auth0Id == User.GetId());
			ViewBag.UserName = currentUser?.Name ?? "GAST";
			ViewBag.UserId = currentUser?.Id ?? -1;
			return View();
		}
	}
}
