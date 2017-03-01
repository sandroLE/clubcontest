using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Server.Kestrel.Internal.Networking;
using Newtonsoft.Json;
using SampleMvcApp.Database;
using SampleMvcApp.DataModels;
using SampleMvcApp.Extensions;
using Microsoft.EntityFrameworkCore;

namespace SampleMvcApp.Controllers
{
	
	public class CompetitionController : Controller
	{
		private readonly DatabaseContext _dbContext;

		public CompetitionController(DatabaseContext dbContext)
		{
			_dbContext = dbContext;
		}

		public IActionResult New()
		{
			var currentUser = _dbContext.User.FirstOrDefault(x => x.Auth0Id == User.GetId());
			ViewBag.UserName = currentUser?.Name ?? "GAST";
			ViewBag.UserId = currentUser?.Id ?? -1;
			
			var userId = User.GetId();
			var name = User.Identity.Name;


			if (!_dbContext.User.Any(x => x.Auth0Id == userId) && !string.IsNullOrEmpty(userId))
			{
				createUser(userId, name);
			}

			return View();
		}

		private void createUser(string userId, string name)
		{
			_dbContext.User.Add(new User
			{
				Auth0Id = userId,
				Name = name
			});
			_dbContext.SaveChanges();
		}


		public JsonResult NameExist(string name)
		{
			if (string.IsNullOrEmpty(name))
			{
				return new JsonResult(new {Exist = false});
			}
			return new JsonResult(new {Exist = _dbContext.Competitions.Any(x => x.Name.ToLower() == name.ToLower())});
		}

		[Authorize]
		[HttpPost]
		public IActionResult Create([FromBody]CreateCompetitionModel competition)
		{
		
			var forbiddenNames = new[] { "index", "new", "getall", "create", "nameexist", "get", "put", "post"}
			
			;
			if (string.IsNullOrEmpty(competition?.Name) || forbiddenNames.Contains(competition.Name.ToLower()))
			{
				return BadRequest();
			}

			var alreadyExist = _dbContext.Competitions.Any(x => x.Name.ToLower() == competition.Name.ToLower());
			if (alreadyExist)
			{
				return BadRequest();
			}

			var newCompetition = new Competition
			{
				Name = competition.Name,
				CreatorId = User.GetDbId(_dbContext)
			};
			_dbContext.Competitions.Add(newCompetition);

			_dbContext.SaveChanges();

			var day = new Day
			{
				CompetitionId = newCompetition.Id,
				Date = DateTime.UtcNow
			};
			_dbContext.Days.Add(day);
			_dbContext.SaveChanges();
		
			
			return Ok();
		}

		[Authorize]
		[HttpPost]
		public IActionResult UpdateAdminUsers([FromBody] UpdateAdminUsersModel competition)
		{
			var c = _dbContext.Competitions.FirstOrDefault(x => x.Id == competition.Id);
			if (c == null)
			{
				return BadRequest();
			}

			if (!User.IsAdminUser(c, _dbContext))
			{
				return BadRequest();
			}
			
			c.AdminUsers = competition.AdminUsers;
			_dbContext.SaveChanges();

			return Ok();
		}



		public JsonResult Get(string name)
		{
			var serializerSettings = new JsonSerializerSettings
			{
				ReferenceLoopHandling = ReferenceLoopHandling.Ignore
			};
			var data = _dbContext.Competitions
				.Include(x => x.Days)
				.ThenInclude(x => x.Flights)
				.ThenInclude(x => x.User)
				.FirstOrDefault(x => x.Name.ToLower() == name.ToLower());


			return new JsonResult(data, serializerSettings);
		}

		public JsonResult GetAll()
		{
			var serializerSettings = new JsonSerializerSettings
			{
				ContractResolver = new Newtonsoft.Json.Serialization.DefaultContractResolver(),
				ReferenceLoopHandling = ReferenceLoopHandling.Ignore
			};

			var competitions = _dbContext.Competitions.OrderBy(x => x.Name);
			return new JsonResult(competitions, serializerSettings);
		}

		public IActionResult Index()
		{
			var currentUser = _dbContext.User.FirstOrDefault(x => x.Auth0Id == User.GetId());
			ViewBag.UserName = currentUser.Name;
			ViewBag.UserId = currentUser.Id;
			return View();
		}

		public JsonResult GetData()
		{
			var c = _dbContext.Competitions.First().Name;
			return new JsonResult(c);
		}
	}



	public class UpdateAdminUsersModel
	{
		public int Id { get; set; }
		public string AdminUsers { get; set; }
	}

	public class CreateCompetitionModel
	{
		public string Name { get; set; }
	}
}