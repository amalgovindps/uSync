using Microsoft.AspNetCore.Mvc;

namespace ImportSyncData.DashC
{
	public class HelloWorldController : Controller
	{
		public IActionResult Index()
		{

			return View("HelloWorld", "HelloWorld");
		}

	}
}
