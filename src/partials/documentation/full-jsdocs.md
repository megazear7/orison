<section>

## orison *1.2.4*

</section>


<section class="jsdocs">

## bin/orison-generator.js


##### new OrisonGenerator(config) 

Creates an OrisonGenerator that can be used to build a website based upon a specially formatted source directory.




###### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| config | `object`  | Required configuration for the generator. | &nbsp; |
| config.rootPath | `string`  | Required. Determines the root path of the source and build directories. | &nbsp; |
| config.generatePath | `string`  | Optional. Defaults to "/". The sub path under the pages directory to generate the site from. Any pages outside of this subpath will not be deleted from the build directory or generated from the source directory. This allows partial builds of certain sub paths of the page hierarhcy. | &nbsp; |
| config.generateSlugs | `array`  | Optional. Defaults to [ ]. A list of slugs to generate for list page types. List pages are a single source page that generates 0 or more pages in the build directory. If a list of slugs is provided these will be provided to the list source page so that the list page knows which pages to generate. This is helpful if you only want to generate pages for certain slugs instead of the list page generating every page. | &nbsp; |
| config.excludedPaths | `array`  | Optional. Defaults to [ ]. A list of paths to exclude from the build. This is helpful for fine tuning what pages get rebuilt. If you want to rebuild the page at /src/pages/example/ but you want to exclude the subdirectories of the example directory they can be listed in this configuration. | &nbsp; |
| config.buildDir | `string`  | Optional. Defaults to "docs". The name of the build directory where the built files will go. The build directory should exist under the root path. | &nbsp; |
| config.protectedFileNames | `array`  | Optional. Defaults to [ "CNAME" ]. Protected file names that will not be deleted from the build directory. This defaults to "CNAME" which is a file that GitHub pages needs for hosting. This list can be updated based upon other hosting providers and setups. | &nbsp; |
| config.staticDirectory | `string`  | Optional. Defaults to "static". The name of the static directory. This directory should exist under the source directory. It will be copied as is into the build directory. | &nbsp; |
| config.pagesDirectory | `string`  | Optional. Defaults to "pages". The name of the pages directory. This directory should exist under the source directory. This is the directory that will be rendered into the build directory and forms the hierarchy of your site. | &nbsp; |
| config.srcDirectory | `string`  | Optional. Defaults to "src". This is the source directory. The static directory, pages directory, and partials directory should all exist under this directory. The source directory should exist under the root path. | &nbsp; |
| config.layoutFileBasename | `string`  | Optional. Defaults to "layout". The basename of the layouts created under the pages directory. Pages are inserted into the nearest layout within the pages hierarchy. As an example if "layout" is provided in this configuration then files named "layout.js" will be interpretted as layouts. | &nbsp; |
| config.dataFileBasename | `string`  | Optional. Defaults to "data". The basename of the data files under the pages directory. The output of these data files are provided to pages and serve as contextual site metadata. | &nbsp; |
| config.fragmentName | `string`  | Optional. Defaults to "fragment". The string to identify fragments with. Fragments are pages that get rendered without the layout. This allows for page content to be requested without the surrounding layout and helps support single page application style linking. If "fragment" is provided, then each page will get a corresponding file built with the format "<page>.fragment.html" where the contents are the same as "<page>.html" but without the layout applied and where <page> is the basename of the corresponding page. | &nbsp; |
| config.loaders | `array`  | Optional. Defaults to an empty array. Any objects put in this array should have a name property that is a string and a loader prop that is a function. Review the documentation on the details for implementing a loader. | &nbsp; |




###### Returns


`OrisonGenerator`  An OrisonGenerator based upon the provided configurations.




##### OrisonGenerator.build() 








###### Returns


 Build the static files for the website based upon the options provided in the constructor. This is essentially a three step process: (1) Delete the directories and files in the buildDir, (2) Copy the static files to the build directory, (3) Generate HTML files in the build directory based upon the page files (HTML, JS, MD) in the pages directory.




</section>


<section class="jsdocs">

## bin/orison-server.js


##### new OrisonServer(config) 

Creates an OrisonServer that can be used to serve a website based upon a specially formatted source directory.




###### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| config | `object`  | Required configuration for the generator. | &nbsp; |
| config.rootPath | `string`  | Required. Determines the root path of the source and build directories. | &nbsp; |
| config.buildDir | `string`  | Optional. Defaults to "docs". The name of the build directory where the built files will go. The build directory should exist under the root path. | &nbsp; |
| config.srcDir | `string`  | Optional. Defaults to "src". This is the source directory. The static directory, pages directory, and partials directory should all exist under this directory. The source directory should exist under the root path. | &nbsp; |
| config.pagesDir | `string`  | Optional. Defaults to "pages". The name of the pages directory. This directory should exist under the source directory. This is the directory that will be rendered into the build directory and forms the hierarchy of your site. | &nbsp; |
| config.staticDir | `string`  | Optional. Defaults to "static". The name of the static directory. This directory should exist under the source directory. It will be copied as is into the build directory. | &nbsp; |
| config.indexFileBasename | `string`  | Optional. Defaults to "index". The base file name (without an extension) of the index files which are returned when a request comes through to a directory url instead of a specific file url. | &nbsp; |
| config.listFileBasename | `string`  | Optional. Defaults to "list". The base file name (without an extension) of the list files. These files are single JS files used to generate a list of pages. | &nbsp; |
| config.layoutFileBasename | `string`  | Optional. Defaults to "layout". The basename of the layouts created under the pages directory. Pages are inserted into the nearest layout within the pages hierarchy. As an example if "layout" is provided in this configuration then files named "layout.js" will be interpretted as layouts. | &nbsp; |
| config.dataFileBasename | `string`  | Optional. Defaults to "data". The basename of the data files under the pages directory. The output of these data files are provided to pages and serve as contextual site metadata. | &nbsp; |
| config.loaderDir | `string`  | Optional. Defaults to "loaders". The directory name under the src directory where the Orison loaders are defined. Review the Orison documentation for how to create a loader. | &nbsp; |
| config.fragmentName | `string`  | Optional. Defaults to "fragment". The string to identify fragments with. Fragments are pages that get rendered without the layout. This allows for page content to be requested without the surrounding layout and helps support single page application style linking. If "fragment" is provided, then each page will get a corresponding file built with the format "<page>.fragment.html" where the contents are the same as "<page>.html" but without the layout applied and where <page> is the basename of the corresponding page. | &nbsp; |
| config.page404 | `string`  | Optional. Defaults to "404.html". The path to the 404 page. If you wish to use a JS file to generate the 404 page then you will need to update this extension. If you move the name of location of the 404 file this property needs updated. | &nbsp; |
| config.page500 | `string`  | Optional. Defaults to "500.html". The path to the 500 page. If you wish to use a JS file to generate the 500 page then you will need to update this extension. If you move the name of location of the 500 file this property needs updated. | &nbsp; |
| config.stripHtml | `string`  | Optional. Defaults to false. This determines if you want to strip the html url extension from urls. | &nbsp; |
| config.loaders | `array`  | Optional. Defaults to an empty array. Any objects put in this array should have a name property that is a string and a loader prop that is a function. Review the documentation on the details for implementing a loader. | &nbsp; |
| config.port | `string`  | Optional. Defaults to 3000. Change this to change the port that is used by the server. | &nbsp; |




###### Returns


`OrisonServer`  An OrisonServer based upon the provided configurations.




##### OrisonServer.start() 








###### Returns


`object`  Start serving the provided src directory at the provided port, rendering pages on the fly. Returns the express server that can be used for further configuration.




</section>


<section class="jsdocs">

## bin/orison-static-server.js


##### new OrisonStaticServer(config) 

Creates an OrisonStaticServer that can serve the result of the OrisonGenerator. This can be used as a preview which more closely matche how the live site will behave than the OrisonServer. It requires that the OrisonGenerator as already been used to generate the static files.




###### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| config | `object`  | Required configuration for the generator. | &nbsp; |
| config.rootPath | `string`  | Required. Determines the root path of the source and build directories. | &nbsp; |
| config.dir | `string`  | Optional. Defaults to 'docs'. This determines what directory the built files are in. This directories contents should be the output of the OrisonGenerator. | &nbsp; |
| config.port | `string`  | Optional. Defaults to '3000'. Change this to change which port the static server should listen to. | &nbsp; |




###### Returns


`OrisonStaticServer`  An OrisonStaticServer based upon the provided configurations.




##### OrisonStaticServer.start() 








###### Returns


`object`  Start serving the provided build directory at the provided port. Returns the express server that can be used for further configuration.




</section>


<section class="jsdocs">

## bin/orison-directory.js


##### new OrisonDirectory(config) 

A class representing a src pages directory. Provides easy to use accessor methods
for retrieving contextual information about that given location under the src pages path.




###### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| config | `object`  | Required. An object with configurations on how the source directory should be interpretted. | &nbsp; |
| config.path | `string`  | Required. The path to the directory that this OrisonDirectory will represent. Should be relative to the pages directory. | &nbsp; |
| config.rootPath | `string`  | Required. The absolute system level path to the root of the project. | &nbsp; |
| config.srcDirectory | `string`  | Optional. The path to the source directory relative to the root directory. | &nbsp; |
| config.pagesDirectory | `string`  | Optional. The path to the pages directory relative to the source directory. | &nbsp; |
| config.layoutFileBasename | `string`  | Optional. The base name of the files to interpret as Orison layouts. These files should return a method which accepts a context object and returns a `TemplateResult`. | &nbsp; |
| config.dataFileBasename | `string`  | Optional. The base name of the files to interpret as data files. These should be json. | &nbsp; |




###### Returns


`OrisonDirectory`  A new OrisonDirectory with the provided configurations.




##### OrisonDirectory.dataPath() 








###### Returns


`string`  The path to the Orison data json file in the current directory.




##### OrisonDirectory.isRoot() 








###### Returns


`boolean`  Whether or not this is the root directory of the src pages.




##### OrisonDirectory.layout() 








###### Returns


`function`  The layout to be used for pages within this directory. It will recursively search up the src pages path to find the closest layout.




##### OrisonDirectory.data() 








###### Returns


`object`  The JSON data associated to this src pages directory, coming from the data json file within this directory. The JSON object will always have a "orison" and "public"
attribute.




##### OrisonDirectory.parent() 








###### Returns


`OrisonDirectory`  The OrisonDirectory object one level up the src pages path. This should not be called when this.isRoot this true.




##### OrisonDirectory.child() 








###### Returns


`OrisonDirectory`  The OrisonDirectory object of the given child directory.




##### OrisonDirectory.children() 








###### Returns


`Array`  An array of OrisonDirectory's representing the children of the current directory. They will be ordered based upon the value of the `child.data.orison.order` property
of each child directory.




##### OrisonDirectory.parents() 








###### Returns


`Array`  An array of OrisonDirectory objects starting with this one and going up the directory hierarchy by calling the parent method until an OrisonDirectory object
returns true for `isRoot`.




</section>


<section class="jsdocs">

## bin/file-walker.js


##### fileWalker(dir, fileCallback, directoryCallback) 

Runs either the fileCallback or the directoryCallback on each file and directory under the given directory.




###### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| dir |  | The directory to recursively walk through. | &nbsp; |
| fileCallback |  | The function to call for each file found. The first parameter to this method is the file path. | &nbsp; |
| directoryCallback |  | The function to call for each directory found. The first parameter to this method is the directory path. | &nbsp; |




###### Returns


`Void`



</section>


<section class="jsdocs">

## bin/markdown.js


##### mdFile(filePath) 

Renders the markdown file at filePath, returning a lit-html template.




###### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| filePath | `string`  | The markdown file to render. | &nbsp; |




###### Returns


`TemplateResult`  A lit-html template result with the rendered markdown file.




##### mdString(string) 

Renders the markdown string, returning a lit-html template.




###### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| string | `string`  | The markdown string to render. | &nbsp; |




###### Returns


`TemplateResult`  A lit-html template result with the renderd markdown string.




</section>


<section class="jsdocs">

## bin/orison-cache-loader.js


##### new OrisonCacheLoader(config) 

A class which generates and maintains a list of Orison loaders. Refer to the Orison documentation on how to implement a lodaer function.




###### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| config | `object`  | Required. An object with configurations on how the source directory should be interpretted. | &nbsp; |
| config.loaderPath | `string`  | Required. The path to the directory containing the loader JS files. | &nbsp; |
| config.initialLoaders | `array`  | Required. An array contain objects each with a 'name' and 'loader' property. The name property should be a string and the loader property should be a function implementing the loader. Any programatically defined loaders. These will take precedence over any loaders found in JS files under the loaderPath. | &nbsp; |




###### Returns


`OrisonCacheLoader`  A new OrisonCacheLoader with the provided configurations.




</section>


<section class="jsdocs">

## bin/orison-path-maker.js


##### new OrisonPathMaker(rootPath, srcDir, pagesDir) 

A class which generates and maintains a list of Orison loaders. Refer to the Orison documentation on how to implement a lodaer function.




###### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| rootPath | `object`  | Required. The absolute rooth path in the file system where the src directory is. | &nbsp; |
| srcDir | `object`  | Required. The name of the src directory. | &nbsp; |
| pagesDir | `object`  | Required. The name of the pages directory. | &nbsp; |




###### Returns


`OrisonCacheLoader`  A new OrisonCacheLoader with the provided configurations.




##### OrisonPathMaker.create() 








###### Returns


`object`  An OrisonPath object based upon the configuration provided in the constructor and the relative src path provided to this method.




##### OrisonPathMaker.pagesPath() 








###### Returns


`string`  the absolute file system path to the pages directory.




##### OrisonPathMaker.srcPath() 








###### Returns


`string`  the absolute file system path to the src directory.




</section>

