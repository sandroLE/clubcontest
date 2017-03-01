using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SampleMvcApp.Database;
using SampleMvcApp.DataModels;
using SampleMvcApp.Extensions;

namespace SampleMvcApp.Controllers
{
	//	[Authorize]
	public class FlightController : Controller
	{
		private readonly DatabaseContext _dbContext;

		public FlightController(DatabaseContext dbContext)
		{
			_dbContext = dbContext;
		}


		public IActionResult Get(int id)
		{
			var serializerSettings = new JsonSerializerSettings
			{
				ContractResolver = new Newtonsoft.Json.Serialization.DefaultContractResolver()
			};

			var flight = _dbContext.Flights.Include(x => x.User).FirstOrDefault(x => x.Id == id);
			if (flight != null)
			{
				flight.Points = flight.CreatePoints();
				return new JsonResult(flight, serializerSettings);
			}
			return BadRequest();
		}

		[Authorize]
		[HttpPost]
		public IActionResult Upload(IFormFile files, int dayId)
		{
			if (Request.Form.Files.Count == 0)
			{
				return BadRequest();
			}
			var stream = new MemoryStream();
			Request.Form.Files[0].CopyTo(stream);
			var igcFile = System.Text.Encoding.UTF8.GetString(stream.ToArray());

			var flight = new Flight();
			flight.DayId = dayId;
			flight.UserId = User.GetDbId(_dbContext);
			flight.IgcFile = igcFile;

			_dbContext.Flights.Add(flight);
			_dbContext.SaveChanges();

			flight = _dbContext.Flights.Include(x => x.User).Single(x => x.Id == flight.Id);
			var serializerSettings = new JsonSerializerSettings
			{
				ContractResolver = new Newtonsoft.Json.Serialization.DefaultContractResolver()
			};
			flight.Points = flight.CreatePoints();
			return new JsonResult(flight, serializerSettings);
		}

		[Authorize]
		[HttpPost]
		public IActionResult Update([FromBody]Flight flight)
		{
			//TODO: check permission

			var f = _dbContext.Flights.FirstOrDefault(x => x.Id == flight.Id);

			if (f != null)
			{
				f.Distance = flight.Distance;
				f.Duration = flight.Duration;
				f.Finished = flight.Finished;
				f.Speed = flight.Speed;
				f.TurnPoints = flight.TurnPoints;
				f.GliderType = flight.GliderType;
				f.Handicap = flight.Handicap;

				_dbContext.SaveChanges();
				f = _dbContext.Flights.Include(x => x.User).Single(x => x.Id == flight.Id);
				f.Points = f.CreatePoints();
				var serializerSettings = new JsonSerializerSettings { ContractResolver = new Newtonsoft.Json.Serialization.DefaultContractResolver() };
				return new JsonResult(f, serializerSettings);
			}
			return BadRequest();


		}


		[Authorize]
		[HttpDelete]
		public IActionResult Delete(int id)
		{
			var flight = _dbContext.Flights.FirstOrDefault(x => x.Id == id);

			if (flight != null)
			{
				var day = _dbContext.Days.FirstOrDefault(d => d.Id == flight.DayId);

				if (day == null)
				{
					return BadRequest();
				}

				var competition = _dbContext.Competitions.Single(x => x.Id == day.CompetitionId);

				if (!User.IsAdminUser(competition, _dbContext))
				{
					return BadRequest();
				}

				_dbContext.Flights.Remove(flight);
				_dbContext.SaveChanges();
				return Ok();
			}
			return BadRequest();

		}
	}

}

