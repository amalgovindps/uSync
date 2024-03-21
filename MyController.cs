

using JsonDiffPatchDotNet;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NPoco;
using NUglify.Helpers;
using SyncData.Model;
using System.IO;
using System.Xml.Linq;
using System.Xml.XPath;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Services.Implement;
using Umbraco.Cms.Core.Strings;
using Umbraco.Cms.Infrastructure.Persistence.Querying;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Cms.Infrastructure.Serialization;
using Umbraco.Cms.Web.Common.Attributes;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Extensions;
using static System.Net.Mime.MediaTypeNames;
using static System.Net.WebRequestMethods;


namespace ImportSyncData
{
	[PluginController("test")]
	public class MyController : UmbracoApiController
	{
		private IDomainService _domainService;
		private IContentService _contentService;
		private readonly IScopeProvider _scopeprovider;
		private IFileService _fileService;
		private IMediaService _mediaService;
		private IContentTypeService _contentTypeService;
		private readonly IDataTypeService _dataTypeService;
		private ILocalizationService _localizationService;
		private readonly MediaFileManager _mediaFileManager;
		private readonly MediaUrlGeneratorCollection _mediaUrlGeneratorCollection;
		private readonly IShortStringHelper _shortStringHelper;
		private readonly IContentTypeBaseServiceProvider _contentTypeBaseServiceProvider;
		private readonly IConfigurationEditorJsonSerializer _configurationEditorJsonSerializer;
		private readonly PropertyEditorCollection _propertyEditorCollection;
		private IMemberGroupService _memberGroupService;
		private IMemberService _memberService;
		private IMemberTypeService _memberTypeServices;
		private IUserService _userService;
		private readonly IWebHostEnvironment _webHostEnvironment;
		List<string> allFiles = new List<string>();
		private readonly IPublishedContentQuery _publishedContent;


		public MyController(
			IContentTypeService contentTypeService,
			 IDataTypeService dataTypeService,
				 IDomainService domainService,
			 IContentService contentService,
			  IScopeProvider scopeProvider,
			IFileService fileService,
			IMediaService mediaService,
			ILocalizationService localizationService,
			IConfigurationEditorJsonSerializer configurationEditorJsonSerializer,
			PropertyEditorCollection dataEditors,
			IMemberGroupService memberGroupService,
			IMemberService memberService,
			IMemberTypeService memberTypeService,
			IUserService userService,
			IWebHostEnvironment webHostEnvironment,
			MediaFileManager mediaFileManager,
			MediaUrlGeneratorCollection mediaUrlGenerators,
			IShortStringHelper shortStringHelper,
			IContentTypeBaseServiceProvider contentTypeBaseServiceProvider,
			IPublishedContentQuery publishedContentQuery
				)
		{
			_domainService = domainService;
			_contentService = contentService;
			_scopeprovider = scopeProvider;
			_fileService = fileService;
			_mediaService = mediaService;
			_contentTypeService = contentTypeService;
			_dataTypeService = dataTypeService;
			_localizationService = localizationService;
			_configurationEditorJsonSerializer = configurationEditorJsonSerializer;
			_propertyEditorCollection = dataEditors;
			_memberGroupService = memberGroupService;
			_memberService = memberService;
			_memberTypeServices = memberTypeService;
			_userService = userService;

			_mediaUrlGeneratorCollection = mediaUrlGenerators;
			_shortStringHelper = shortStringHelper;
			_contentTypeBaseServiceProvider = contentTypeBaseServiceProvider;
			_webHostEnvironment = webHostEnvironment;
			_mediaFileManager = mediaFileManager;
			_publishedContent = publishedContentQuery;
		}

		[HttpGet]
		public IActionResult testCall()
		{
			ImageProc imageNameKey = new ImageProc();

			var content = _publishedContent.Content(1092);
			var dsd = content.Value("image").GetType();
			MediaWithCrops? tr = content.Value("image") as MediaWithCrops;
			var medias = _mediaService.GetRootMedia().Where(x=>x.Key == tr.Key).FirstOrDefault();
			if (tr != null)
			{
				var ds = _mediaService.GetById(tr.Key);
				if (ds != null)
				{
					var umbracoFile = ds.GetValue<string>(Constants.Conventions.Media.File);
					var sds = JsonConvert.DeserializeObject<MediaNameKey>(umbracoFile);
					umbracoFile = Path.Combine(this._webHostEnvironment.WebRootPath + sds.Src);
					byte[] imageArray = System.IO.File.ReadAllBytes(umbracoFile);
					string base64ImageRepresentation = Convert.ToBase64String(imageArray);
					if (base64ImageRepresentation != null)
					{
						imageNameKey.Key = tr.Key;
						imageNameKey.SortOrder = tr.SortOrder;
						imageNameKey.Level = tr.Level;
						imageNameKey.Parent = tr.Parent != null ? tr.Parent.Key : Guid.Empty;
						imageNameKey.Name = tr.Name;
						imageNameKey.Path = JsonConvert.DeserializeObject<ImageProc>(medias.Properties.FirstOrDefault().Values.FirstOrDefault().EditedValue.ToString()).Src;
						imageNameKey.Src = base64ImageRepresentation;
						imageNameKey.ContentType = tr.ContentType.Alias.ToString();
					}
				}
			}

			return Ok(imageNameKey);
		}


		[HttpGet]
		public IActionResult testCall2(ImageProc imageSrc)
		{
			string? mediaPath = _webHostEnvironment.MapPathWebRoot("~/media");
			IMedia? _media = _mediaService.GetRootMedia().Where(x => x.Name == imageSrc.Name).FirstOrDefault();

			if (_media == null)
			{
				bool success = SaveImage(imageSrc.Src, imageSrc.Name, imageSrc.Path.Remove(0, 1).Replace("/", "\\"));
				if (success)
				{
					try
					{
						string pth = Path.Combine(this._webHostEnvironment.WebRootPath, imageSrc.Path.Remove(0, 1).Replace("/", "\\"));
						using (Stream stream = System.IO.File.OpenRead(pth))
						{
							var parentMedia = _mediaService.GetRootMedia().Where(x => x.Key == imageSrc.Parent).FirstOrDefault();
							int parent = -1;
							if (parentMedia != null)
							{
								parent = parentMedia.Id;
							}

							IMedia media = _mediaService.CreateMedia(imageSrc.Name + ".jpg", parent, imageSrc.ContentType);
							media.SetValue(Constants.Conventions.Media.File, imageSrc.Path);
							media.Key = imageSrc.Key;
							media.Level = Convert.ToInt32(imageSrc.Level);
							media.SortOrder = Convert.ToInt32(imageSrc.SortOrder);
							var result = _mediaService.Save(media);
						}
					}
					catch (Exception ex)
					{
					}
				}
			}
				
				return Ok("Done");
		}
		public bool SaveImage(string ImgStr, string ImgName, string path)
		{
			try
			{
				var pathSpl = path.Split("\\");
				String srcpath = Path.Combine(this._webHostEnvironment.WebRootPath, pathSpl[0], pathSpl[1]);
				//Check if directory exist
				if (!Directory.Exists(srcpath))
				{
					Directory.CreateDirectory(srcpath); //Create directory if it doesn't exist
				}
				string imageName = ImgName + ".jpg";
				//set the image path
				string imgPath = Path.Combine(srcpath, pathSpl[2]);
				byte[] imageBytes = Convert.FromBase64String(ImgStr);
				System.IO.File.WriteAllBytes(imgPath, imageBytes);
				return true;
			}
			catch (Exception ex)
			{
				return false;
			}
		}
	}
	public class ImageProc
	{
		public Guid Key { get; set; }
		public int Level { get; set; }
		public int SortOrder { get; set; }
		public Guid Parent { get; set; }
		public string Src { get; set; }
		public string Name { get; set; }
		public string Path { get; set; }
		public string ContentType { get; set; }
	}
}
/**
 * try
			{
				var pathSpl = path.Split("\\");
				String srcpath = Path.Combine(this._webHostEnvironment.WebRootPath, pathSpl[0], pathSpl[1]);
				//Check if directory exist
				if (!Directory.Exists(srcpath))
				{
					Directory.CreateDirectory(srcpath); //Create directory if it doesn't exist
				}
				string imageName = ImgName + ".jpg";
				//set the image path
				string imgPath = Path.Combine(srcpath, pathSpl[2]);

				byte[] imageBytes = Convert.FromBase64String(ImgStr);
				System.IO.File.WriteAllBytes(imgPath, imageBytes);
				return true;
			}
			catch (Exception ex)
			{
				//_logger.LogError("Save Image to folder Exception with {ex}", ex);
				return false;
			}
 * var mediaPath = _webHostEnvironment.MapPathWebRoot("~/media");
			var _media = _mediaService.GetRootMedia().Where(x => x.Name == imageSrc.Name).FirstOrDefault();

			if (_media == null)
			{
				SaveImage(imageSrc.Src, imageSrc.Name, imageSrc.Path.Remove(0,1).Replace("/","\\"));
				try
				{
					string pth = Path.Combine(this._webHostEnvironment.WebRootPath, imageSrc.Path.Remove(0, 1).Replace("/", "\\"));
					using (Stream stream = System.IO.File.OpenRead(pth))
					{
						var parentMedia = _mediaService.GetRootMedia().Where(x => x.Key == imageSrc.Parent).FirstOrDefault();
						int parent = -1;
						if(parentMedia != null) {
							parent = parentMedia.Id;
						}
						
						IMedia media = _mediaService.CreateMedia(imageSrc.Name + ".jpg", parent, imageSrc.ContentType);
						media.SetValue(Constants.Conventions.Media.File, imageSrc.Path);
						media.Key = imageSrc.Key;
						media.Level = Convert.ToInt32(imageSrc.Level);
						media.SortOrder = Convert.ToInt32(imageSrc.SortOrder);
						var result = _mediaService.Save(media);
					}
				}
				catch (Exception ex)
				{
					//_logger.LogError("Image Update Error with exception {ex}", ex);
				}
			}
			else
			{
				//var content = _publishedContent.Content(id);

				//MediaWithCrops? tr = content.Value("image") as MediaWithCrops;

				//if (tr?.Name == imageSrc.Name)
				//{
				//return;
				//}
				IMedia? media = _mediaService.GetById(_media.Id);
				//var parent = _contentService.GetById(id);
				//if (parent != null)
				//{
				//	parent?.SetValue("Image", media.GetUdi().ToString());
				//}
				//_contentService.SaveAndPublish(parent);
			}
 * var diffObj = new JsonDiffPatch();

			var allPubUnPubContent = new List<IContent>();
			var rootNodes = _contentService.GetRootContent();

			var query = new Query<IContent>(_scopeprovider.SqlContext).Where(x => x.Published || x.Trashed);

			foreach (var c in rootNodes)
			{
				allPubUnPubContent.Add(c);
				var descendants = _contentService.GetPagedDescendants(c.Id, 0, int.MaxValue, out long totalNodes, query);
				allPubUnPubContent.AddRange(descendants);
			}

			foreach (var c in allPubUnPubContent)
			{
				List<IContent>? currnt = _contentService.GetVersions(c.Id).ToList();
				
				var titleProp0= currnt.Where(x=> x.Properties.All(x=>x.Id != 0));
				//var titleProp1 = currnt[1].Properties.Where(x => x.Alias == ("title")).FirstOrDefault();
				var a = JsonConvert.SerializeObject(currnt[0].Properties[1].Values.FirstOrDefault());
				//var b = JsonConvert.SerializeObject(currnt[2].Properties[1].Values.FirstOrDefault());

				//var dsd = diffObj.Diff(a, b);

			}
 * 
 * 
 * string folder = "Sync\\Datatypes";
			string[] files = Directory.GetFiles(folder);
			var allDataType = _dataTypeService.GetAll();

			foreach (string file in files)
			{
				XElement readFile = XElement.Load(file); // XElement.Parse(stringWithXmlGoesHere)
				XElement? root = new XElement(readFile.Name, readFile.Attributes());


				string? keyVal = root.Attribute("Key").Value ?? "";
				string? nameVal = readFile.Element("Info").Element("Name").Value ?? "";
				string? editorAlias = readFile.Element("Info").Element("EditorAlias").Value ?? "";
				string? databaseType = readFile.Element("Info").Element("DatabaseType").Value ?? "";
				string? configVal = readFile.Element("Config").Value ?? "";
				
var existDataType = allDataType.Where(x => x.Key == new Guid(keyVal)).FirstOrDefault();
IDataEditor? dataTypeName = _propertyEditorCollection.Where(x => x.Alias == editorAlias).FirstOrDefault();


if (existDataType == null)
{
	existDataType = new DataType(dataTypeName, _configurationEditorJsonSerializer, -1) { Id = existDataType != null ? existDataType.Id : 0 };
	existDataType.Key = new Guid(keyVal);
	existDataType.Name = nameVal;
	string? configSer = _configurationEditorJsonSerializer.Serialize(dataTypeName.Name);
	existDataType.DatabaseType = (ValueStorageType)Enum.Parse(typeof(ValueStorageType), databaseType);
}
else if (existDataType.Name != nameVal)
{
	existDataType.Name = nameVal;
}
if (existDataType.EditorAlias == "Umbraco.ContentPicker")
{
	var config = JsonConvert.DeserializeObject<ContentPickerConfiguration>(configVal);
	if (config != null)
	{
		ContentPickerConfiguration prevalues = (ContentPickerConfiguration)existDataType.Configuration;
		prevalues.IgnoreUserStartNodes = config.IgnoreUserStartNodes;
		prevalues.ShowOpenButton = config.ShowOpenButton;
		prevalues.StartNodeId = config.StartNodeId;
	}
}
else if (existDataType.EditorAlias == "Umbraco.DateTime")
{
	var config = JsonConvert.DeserializeObject<DateTimeConfiguration>(configVal);
	if (config != null)
	{
		DateTimeConfiguration prevalues = (DateTimeConfiguration)existDataType.Configuration;
		prevalues.Format = config.Format;
		prevalues.OffsetTime = config.OffsetTime;
	}
}
else if (existDataType.EditorAlias == "Umbraco.ColorPicker")
{
	var config = JsonConvert.DeserializeObject<ColorPickerConfiguration>(configVal);
	if (config != null)
	{
		ColorPickerConfiguration prevalues = (ColorPickerConfiguration)existDataType.Configuration;
		prevalues.Items = config.Items;
		prevalues.UseLabel = config.UseLabel;
	}
}
else if (existDataType.EditorAlias == "Umbraco.CheckBoxList")
{
	var config = JsonConvert.DeserializeObject<ValueListConfiguration>(configVal);
	if (config != null)
	{
		ValueListConfiguration? prevalues = (ValueListConfiguration)existDataType.Configuration;
		prevalues.Items = config.Items;
	}
}
else if (existDataType.EditorAlias == "Umbraco.DropDown.Flexible")
{
	var config = JsonConvert.DeserializeObject<DropDownFlexibleConfiguration>(configVal);
	if (config != null)
	{
		DropDownFlexibleConfiguration prevalues = (DropDownFlexibleConfiguration)existDataType.Configuration;
		prevalues.Items = config.Items;
		prevalues.Multiple = config.Multiple;
	}
}
else if (existDataType.EditorAlias == "Umbraco.ImageCropper")
{
	var config = JsonConvert.DeserializeObject<ImageCropperConfiguration>(configVal);
	if (config != null)
	{
		ImageCropperConfiguration prevalues = (ImageCropperConfiguration)existDataType.Configuration;
		prevalues.Crops = config.Crops;
	}
}
else if (existDataType.EditorAlias == "Umbraco.MediaPicker3")
{
	var config = JsonConvert.DeserializeObject<MediaPicker3Configuration>(configVal);
	if (config != null)
	{
		MediaPicker3Configuration prevalues = (MediaPicker3Configuration)existDataType.Configuration;
		prevalues.Crops = config.Crops;
		prevalues.EnableLocalFocalPoint = config.EnableLocalFocalPoint;
		prevalues.Filter = config.Filter;
		prevalues.IgnoreUserStartNodes = config.IgnoreUserStartNodes;
		prevalues.Multiple = config.Multiple;
		prevalues.StartNodeId = config.StartNodeId;
		prevalues.ValidationLimit = config.ValidationLimit;
	}
}
else if (existDataType.EditorAlias == "Umbraco.Label")
{
	var config = JsonConvert.DeserializeObject<LabelConfiguration>(configVal);
	if (config != null)
	{
		LabelConfiguration prevalues = (LabelConfiguration)existDataType.Configuration;
		prevalues.ValueType = config.ValueType;
	}
}
else if (existDataType.EditorAlias == "Umbraco.ListView")
{
	var config = JsonConvert.DeserializeObject<ListViewConfiguration>(configVal);
	if (config != null)
	{
		ListViewConfiguration prevalues = (ListViewConfiguration)existDataType.Configuration;
		prevalues.BulkActionPermissions = config.BulkActionPermissions;
		prevalues.Icon = config.Icon;
		prevalues.IncludeProperties = config.IncludeProperties;
		prevalues.Layouts = config.Layouts;
		prevalues.OrderBy = config.OrderBy;
		prevalues.OrderDirection = config.OrderDirection;
		prevalues.PageSize = config.PageSize;
		prevalues.ShowContentFirst = config.ShowContentFirst;
		prevalues.TabName = config.TabName;
		prevalues.UseInfiniteEditor = config.UseInfiniteEditor;
	}
}
else if (existDataType.EditorAlias == "Umbraco.MemberPicker") //todo
{
	var config = JsonConvert.DeserializeObject(configVal);
	if (config != null)
	{

	}
}
else if (existDataType.EditorAlias == "Umbraco.MultiUrlPicker")
{
	var config = JsonConvert.DeserializeObject<MultiUrlPickerConfiguration>(configVal);
	if (config != null)
	{
		MultiUrlPickerConfiguration prevalues = (MultiUrlPickerConfiguration)existDataType.Configuration;
		prevalues.HideAnchor = config.HideAnchor;
		prevalues.IgnoreUserStartNodes = config.IgnoreUserStartNodes;
		prevalues.MaxNumber = config.MaxNumber;
		prevalues.MinNumber = config.MinNumber;
		prevalues.OverlaySize = config.OverlaySize;
	}

}
else if (existDataType.EditorAlias == "Umbraco.Integer")
{
	var config = JsonConvert.DeserializeObject(configVal);
	if (config != null)
	{

	}
}
else if (existDataType.EditorAlias == "Umbraco.TinyMCE")
{
	var config = JsonConvert.DeserializeObject<RichTextConfiguration>(configVal);
	if (config != null)
	{
		RichTextConfiguration prevalues = (RichTextConfiguration)existDataType.Configuration;
		prevalues.Editor = config.Editor;
		prevalues.HideLabel = config.HideLabel;
		prevalues.IgnoreUserStartNodes = config.IgnoreUserStartNodes;
		prevalues.MediaParentId = config.MediaParentId;
		prevalues.OverlaySize = config.OverlaySize;
	}
}
else if (existDataType.EditorAlias == "Umbraco.Tags")
{
	var config = JsonConvert.DeserializeObject<TagConfiguration>(configVal);
	if (config != null)
	{
		TagConfiguration prevalues = (TagConfiguration)existDataType.Configuration;
		prevalues.Delimiter = config.Delimiter;
		prevalues.Group = config.Group;
		prevalues.StorageType = config.StorageType;
	}
}
else if (existDataType.EditorAlias == "Umbraco.TextBox")
{
	var config = JsonConvert.DeserializeObject<TextboxConfiguration>(configVal);
	if (config != null)
	{
		TextboxConfiguration prevalues = (TextboxConfiguration)existDataType.Configuration;
		prevalues.MaxChars = config.MaxChars;
	}
}
else if (existDataType.EditorAlias == "Umbraco.TextArea")
{
	var config = JsonConvert.DeserializeObject<TextAreaConfiguration>(configVal);
	if (config != null)
	{
		TextAreaConfiguration prevalues = (TextAreaConfiguration)existDataType.Configuration;
		prevalues.MaxChars = config.MaxChars;
		prevalues.Rows = config.Rows;
	}
}
else if (existDataType.EditorAlias == "Umbraco.TrueFalse")
{
	var config = JsonConvert.DeserializeObject<TrueFalseConfiguration>(configVal);
	if (config != null)
	{
		TrueFalseConfiguration prevalues = (TrueFalseConfiguration)existDataType.Configuration;
		prevalues.Default = config.Default;
		prevalues.LabelOff = config.LabelOff;
		prevalues.LabelOn = config.LabelOn;
		prevalues.ShowLabels = config.ShowLabels;
	}
}
else if (existDataType.EditorAlias == "Umbraco.UploadField")
{
	var config = JsonConvert.DeserializeObject<FileUploadConfiguration>(configVal);
	if (config != null)
	{
		FileUploadConfiguration prevalues = (FileUploadConfiguration)existDataType.Configuration;
		prevalues.FileExtensions = config.FileExtensions;
	}
}
else if (existDataType.EditorAlias == "Umbraco.MediaPicker")
{
	var config = JsonConvert.DeserializeObject<MediaPickerConfiguration>(configVal);
	if (config != null)
	{
		MediaPickerConfiguration prevalues = (MediaPickerConfiguration)existDataType.Configuration;
		prevalues.DisableFolderSelect = config.DisableFolderSelect;
		prevalues.IgnoreUserStartNodes = config.IgnoreUserStartNodes;
		prevalues.Multiple = config.Multiple;
		prevalues.OnlyImages = config.OnlyImages;
		prevalues.StartNodeId = config.StartNodeId;
	}
}
else if (existDataType.EditorAlias == "Umbraco.RadioButtonList")
{
	var config = JsonConvert.DeserializeObject<ValueListConfiguration>(configVal);
	if (config != null)
	{
		ValueListConfiguration prevalues = (ValueListConfiguration)existDataType.Configuration;
		prevalues.Items = config.Items;
	}
}
else
{
	if (existDataType.EditorAlias == "sds")
	{

	}
}
_dataTypeService.Save(existDataType);

			}*/