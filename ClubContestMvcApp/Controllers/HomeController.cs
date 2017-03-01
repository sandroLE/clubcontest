using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SampleMvcApp.Database;
using SampleMvcApp.DataModels;
using SampleMvcApp.Extensions;
using SampleMvcApp.ViewModels;

namespace SampleMvcApp.Controllers
{
	public class HomeController : Controller
	{
		private readonly DatabaseContext _dbContext;

		public HomeController(DatabaseContext dbContext)
		{
			_dbContext = dbContext;
		}

		public IActionResult Index()
		{
			return View();
		}




		public IActionResult Error()
		{
			return View();
		}

		public IActionResult Imprint()
		{
			return View();
		}
	}
}
