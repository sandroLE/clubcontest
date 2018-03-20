using System;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Text.Unicode;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.WebEncoders;
using Microsoft.IdentityModel.Tokens;
using SampleMvcApp.Database;


namespace SampleMvcApp
{
	public class Startup
	{
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}
		public IConfiguration Configuration { get; }


		// This method gets called by the runtime. Use this method to add services to the container.
		public void ConfigureServices(IServiceCollection services)
		{
			// Add authentication services
			services.AddAuthentication(options =>
			{
				options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
				options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
				options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
			})
			.AddCookie()
			.AddOpenIdConnect("Auth0", options =>
			{
				options.Authority = $"https://{Configuration["Auth0:Domain"]}";
				options.ClientId = Configuration["Auth0:ClientId"];
				options.ClientSecret = Configuration["Auth0:ClientSecret"];

				options.ResponseType = "code";
								
				options.Scope.Clear();
				options.Scope.Add("openid");
				options.Scope.Add("profile");
				options.Scope.Add("email");
				/*	options.Scope.Add("picture");
					options.Scope.Add("color");
					options.Scope.Add("competions");
					options.Scope.Add("role");
					options.Scope.Add("profile");	*/
				options.CallbackPath = new PathString("/signin-auth0");

				options.ClaimsIssuer = "Auth0";

				options.TokenValidationParameters = new TokenValidationParameters
				{
					NameClaimType = "name"
				};



				options.Events = new OpenIdConnectEvents
				{
					// handle the logout redirection 
					OnRedirectToIdentityProviderForSignOut = (context) =>
					{
						var logoutUri = $"https://{Configuration["Auth0:Domain"]}/v2/logout?client_id={Configuration["Auth0:ClientId"]}";

						var postLogoutUri = context.Properties.RedirectUri;
						if (!string.IsNullOrEmpty(postLogoutUri))
						{
							if (postLogoutUri.StartsWith("/"))
							{
											// transform to absolute
											var request = context.Request;
								postLogoutUri = request.Scheme + "://" + request.Host + request.PathBase + postLogoutUri;
							}
							logoutUri += $"&returnTo={ Uri.EscapeDataString(postLogoutUri)}";
						}

						context.Response.Redirect(logoutUri);
						context.HandleResponse();

						return Task.CompletedTask;
					}
				};
			});

			// Add framework services.
			services.AddMvc();


			services.AddDbContext<DatabaseContext>(options => options.UseSqlServer(Configuration["Data:DatabaseConnection:ConnectionString"]));

			services.AddCors(options =>
			{
				options.AddPolicy("AllowAll", builder =>
				{
					builder.AllowAnyOrigin()
														.AllowAnyMethod()
														.AllowAnyHeader()
														.WithExposedHeaders("X-Auth-User", "X-Auth-Token", "X-HTTP-Method-Override");
				});
			});
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
		{
			loggerFactory.AddConsole(Configuration.GetSection("Logging"));
			loggerFactory.AddDebug();

			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
			}
			else
			{
				app.UseExceptionHandler("/Home/Error");
			}

			app.UseStaticFiles();
			app.UseAuthentication();
			app.UseCors("AllowAll");

			app.UseMvc(routes =>
			{
				routes.MapRoute(name: "default", template: "{controller=Competition}/{action=New}/{id?}");
				routes.MapRoute("NotFound", "Competition/{*url}", new { controller = "Competition", action = "New" });
			});




		}
	}
}



/*
 * 
 	services.AddDbContext<DatabaseContext>(options =>
							options.UseSqlServer(Configuration["Data:DatabaseConnection:ConnectionString"]));

			services.AddCors(options =>
			{
				options.AddPolicy("AllowAll", builder =>
					{
						builder.AllowAnyOrigin()
															.AllowAnyMethod()
															.AllowAnyHeader()
															.WithExposedHeaders("X-Auth-User", "X-Auth-Token", "X-HTTP-Method-Override");
					});
			});

			services.Configure<WebEncoderOptions>(options =>
			{
				options.TextEncoderSettings = new TextEncoderSettings(UnicodeRanges.All);
			}); 
 
  
 * */
