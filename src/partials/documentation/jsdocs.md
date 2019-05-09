# [orison](https://orison.alexlockhart.me) *1.0.30*

> A static site generator built on top of lit-html.


### bin/file-walker.js


#### fileWalker(dir, fileCallback, directoryCallback) 

Runs either the fileCallback or the directoryCallback on each file and directory under the given directory.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| dir |  | The directory to recursively walk through. | &nbsp; |
| fileCallback |  | The function to call for each file found. The first parameter to this method is the file path. | &nbsp; |
| directoryCallback |  | The function to call for each directory found. The first parameter to this method is the directory path. | &nbsp; |




##### Returns


- `Void`




### bin/markdown.js


#### mdFile(filePath) 

Renders the markdown file at filePath, returning a lit-html template.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| filePath |  | The markdown file to render. | &nbsp; |




##### Returns


- `Void`



#### mdString(filePath) 

Renders the markdown string, returning a lit-html template.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| filePath |  | The markdown string to render. | &nbsp; |




##### Returns


- `Void`




### bin/orison-directory.js


#### new OrisonDirectory() 

A class representing a src pages directory. Provides easy to use accessor methods
for retrieving contextual information about that given location under the src pages path.






##### Returns


- `Void`



#### OrisonDirectory._fullPath() 

The full path including the file system root.






##### Returns


- `Void`



#### OrisonDirectory.dataPath() 

The path to the Orison data json file in the current directory.






##### Returns


- `Void`



#### OrisonDirectory.isRoot() 

Whether or not this is the root directory of the src pages.






##### Returns


- `Void`



#### OrisonDirectory.layout() 

The layout to be used for pages within this directory. It will recursively
search up the src pages path to find the closest layout.






##### Returns


- `Void`



#### OrisonDirectory.data() 

The JSON data associated to this src pages directory, coming from the data json
file within this directory. The JSON object will always have a "orison" and "public"
attribute.






##### Returns


- `Void`



#### OrisonDirectory.parent() 

The OrisonDirectory object one level up the src pages path. This should not
be called when this.isRoot this true.






##### Returns


- `Void`



#### OrisonDirectory.child() 

The OrisonDirectory object of the given child directory.






##### Returns


- `Void`



#### OrisonDirectory.children() 

An array of OrisonDirectory's representing the children of the current directory.
They will be ordered based upon the value of the `child.data.orison.order` property
of each child directory.






##### Returns


- `Void`



#### OrisonDirectory.parents() 

An array of OrisonDirectory objects starting with this one and going up the
directory hierarchy by calling the parent method until an OrisonDirectory object
returns true for `isRoot`.






##### Returns


- `Void`




### bin/orison-generator.js


#### new OrisonGenerator() 








##### Returns


- `Void`



#### OrisonGenerator.constructor(config) 

Creates an OrisonGenerator that can be used to build a website based upon a specially formatted source directory.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| config |  | Required configuration for the generator. | &nbsp; |
| config.rootPath |  | Required. Determines the root path of the source and build directories. | &nbsp; |
| config.generatePath |  | Optional. Defaults to "/". The sub path under the pages directory to generate the site from. Any pages outside of this subpath will not be deleted from the build directory or generated from the source directory. This allows partial builds of certain sub paths of the page hierarhcy. | &nbsp; |
| config.generateSlugs |  | Optional. Defaults to [ ]. A list of slugs to generate for list page types. List pages are a single source page that generates 0 or more pages in the build directory. If a list of slugs is provided these will be provided to the list source page so that the list page knows which pages to generate. This is helpful if you only want to generate pages for certain slugs instead of the list page generating every page. | &nbsp; |
| config.excludedPaths |  | Optional. Defaults to [ ]. A list of paths to exclude from the build. This is helpful for fine tuning what pages get rebuilt. If you want to rebuild the page at /src/pages/example/ but you want to exclude the subdirectories of the example directory they can be listed in this configuration. | &nbsp; |
| config.buildDir |  | Optional. Defaults to "docs". The name of the build directory where the built files will go. The build directory should exist under the root path. | &nbsp; |
| config.protectedFileNames |  | Optional. Defaults to [ "CNAME" ]. Protected file names that will not be deleted from the build directory. This defaults to "CNAME" which is a file that GitHub pages needs for hosting. This list can be updated based upon other hosting providers and setups. | &nbsp; |
| config.staticDirectory |  | Optional. Defaults to "static". The name of the static directory. This directory should exist under the source directory. It will be copied as is into the build directory. | &nbsp; |
| config.pagesDirectory |  | Optional. Defaults to "pages". The name of the pages directory. This directory should exist under the source directory. This is the directory that will be rendered into the build directory and forms the hierarchy of your site. | &nbsp; |
| config.srcDirectory |  | Optional. Defaults to "src". This is the source directory. The static directory, pages directory, and partials directory should all exist under this directory. The source directory should exist under the root path. | &nbsp; |
| config.layoutFileBasename |  | Optional. Defaults to "layout". The basename of the layouts created under the pages directory. Pages are inserted into the nearest layout within the pages hierarchy. As an example if "layout" is provided in this configuration then files named "layout.js" will be interpretted as layouts. | &nbsp; |
| config.dataFileBasename |  | Optional. Defaults to "data". The basename of the data files under the pages directory. The output of these data files are provided to pages and serve as contextual site metadata. | &nbsp; |
| config.fragmentName |  | Optional. Defaults to "fragment". The string to identify fragments with. Fragments are pages that get rendered without the layout. This allows for page content to be requested without the surrounding layout and helps support single page application style linking. If "fragment" is provided, then each page will get a corresponding file built with the format "<page>.fragment.html" where the contents are the same as "<page>.html" but without the layout applied and where <page> is the basename of the corresponding page. | &nbsp; |




##### Returns


- `Void`




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
