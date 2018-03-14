using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SampleMvcApp.Database;
using SampleMvcApp.DataModels;
using SampleMvcApp.Entities;
using SampleMvcApp.Extensions;

namespace SampleMvcApp.Controllers
{
//	[Authorize]
	public class DayController : Controller
	{
		private readonly DatabaseContext _dbContext;

		public DayController(DatabaseContext dbContext)
		{
			_dbContext = dbContext;
		}

		public JsonResult Get(int id)
		{
			var day = _dbContext.Days
				.Include(x => x.Flights).ThenInclude(x => x.User)
				.FirstOrDefault(x => x.Id == id);

			if (day == null)
			{
				return new JsonResult(null);
			}
			 day.XcSoarTask =  XcSoarTask.Parse(day.Task);

			var serializerSettings = new JsonSerializerSettings
			{
				ContractResolver = new Newtonsoft.Json.Serialization.DefaultContractResolver(),
				ReferenceLoopHandling = ReferenceLoopHandling.Ignore
			};

			return new JsonResult(day, serializerSettings);
		}

#if !DEBUG
		[Authorize] 
#endif
		[HttpPost]		
		public JsonResult New([FromBody]Day day)
		{
			_dbContext.Days.Add(day);
			_dbContext.SaveChanges();

			var serializerSettings = new JsonSerializerSettings
			{
				ContractResolver = new Newtonsoft.Json.Serialization.DefaultContractResolver()
			};
			return new JsonResult(day, serializerSettings);
		}

#if !DEBUG
		[Authorize] 
#endif
		public IActionResult UploadTask(IFormFile files, int dayId)
		{
			var stream = new MemoryStream();
			Request.Form.Files[0].CopyTo(stream);
			var taskDefinition = System.Text.Encoding.UTF8.GetString(stream.ToArray());

			var day = _dbContext.Days.FirstOrDefault(x => x.Id == dayId);
			day.Task = taskDefinition;
			day.TaskFileFormat = "XcSoar";

			var task = XcSoarTask.Parse(taskDefinition);
			if (task != null)
			{
				_dbContext.SaveChanges();
				return Ok(day);
			}
			else
			{
				return BadRequest();
			}
		}

		public IActionResult DownloadTask(int dayId)
		{
			var day = _dbContext.Days.Include(x => x.Competition)
				.FirstOrDefault(d => d.Id == dayId);

			if (day == null)
			{
				return BadRequest();
			}

			var ms = new MemoryStream(Encoding.UTF8.GetBytes(day.Task ?? ""));
			return File(ms, "text/plain", $"task_{day.Competition.Name}_{day.Date:yyMMdd}.tsk");
		}

#if !DEBUG
		[Authorize] 
#endif
		[HttpDelete]
		public IActionResult Delete(int id)
		{
			var day = _dbContext.Days.FirstOrDefault(x => x.Id == id);
				
			if (day != null)
			{
				var competition = _dbContext.Competitions.Single(x => x.Id == day.CompetitionId);

				if (!User.IsAdminUser(competition, _dbContext))
				{
					return BadRequest();
				}
				
				_dbContext.Days.Remove(day);
				_dbContext.SaveChanges();
				return Ok();
			}
			return BadRequest();

		}

		[HttpPost]
		public IActionResult UpdateTask([FromBody] TaskUpdateModel data)
		{
			var day = _dbContext.Days.Include(x => x.Competition).FirstOrDefault(x => x.Id == data.DayId);
			if (day == null)
			{
				return BadRequest();
			}

			if (!User.IsAdminUser(day.Competition, _dbContext))
			{
				return BadRequest();
			}

			day.Task = data.Task.ToXml();

			_dbContext.SaveChanges();

			return Ok();
		}

		public class TaskUpdateModel
		{
			public XcSoarTask Task { get; set; }
			public int DayId	 { get; set; }
		}

	}


}
