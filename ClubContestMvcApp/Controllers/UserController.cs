using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SampleMvcApp.Database;
using SampleMvcApp.Extensions;

namespace SampleMvcApp.Controllers
{
	[Authorize]
	public class UserController : Controller
	{
		private readonly DatabaseContext _dbContext;


		public UserController(DatabaseContext dbContext)
		{
			_dbContext = dbContext;
		}

		public IActionResult IsAdmin(int competitionId)
		{
			var c = _dbContext.Competitions.FirstOrDefault(x => x.Id == competitionId);
			if (c == null)
			{
				return BadRequest();
			}

			return Ok(User.IsAdminUser(c, _dbContext));
		}
        
        [HttpPost]
	    public IActionResult SaveSettings([FromBody] UserSettings userSettings)
	    {
	        var user = _dbContext.User.FirstOrDefault(x => x.Auth0Id == User.GetId());
	        if (user != null)
	        {
	            user.Name = userSettings.DisplayName;
	            _dbContext.SaveChanges();
	        }
            return Ok();

	    }
	}

    public class UserSettings  
    {
        public string DisplayName { get; set; }
    }
}
