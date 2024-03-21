using Umbraco.Cms.Web.Common.ApplicationBuilder;

namespace ImportSyncData.DashC
{
	public static partial class UmbracoApplicationBuilderExtensions
	{
		public static IUmbracoEndpointBuilderContext UseCustomRoutingRules(this IUmbracoEndpointBuilderContext app)
		{

			app.EndpointRouteBuilder.MapControllerRoute("AdminDefault",
				 "/umbraco/backoffice/Plugins/Admin/HelloWorld",
				 new
				 {
					 Controller = "HelloWorld",
					 Action = "Index"
				 });

			return app;

		}
	}
}
