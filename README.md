Tabs for Qlik Sense (Compatible with Qlik Sense 2.1)

The **Tabs for Qlik Sense** is an extension which allows you to add tabs on Qlik Sense.

## Demo

![Alt text](./images/Demo.png)

## Install
1. Qlik Sense Desktop
Unzip the downloaded zip file into "C:\Users\%USERNAME%\Documents\Qlik\Sense\Extensions\" folder.

2. Qlik Sense Server
Please refer to the following instruction for importing an extension:

	[Import Extension]( http://help.qlik.com/sense/en-US/online/#../Subsystems/ManagementConsole/Content/QMC_Resources_Extensions_AddingExtensions.htm?Highlight=add extension "Import Extension")

Remove "images", "preview.png", "README.md" and other git related files before importing the extension.

## Usage
1. Open a Qlik Sense App.
2. Create charts you would like to display on the tab extension and add them to master items. (You can delete the charts after you added them to master items.)
3. Drag and drop the "Tabs" extension onto the canvas.
4. On the extension property, navigate to Settings>Properties and change the "Number of Tabs" to change the number of tabs displayed on the extension.
5. Select a chart on the drop-down list and modify the label for each tab.

## Limitations
1. Right-click context menu (including take snapshot, open exploration menu, export to PDF, etc) is disabled for tabbed chart.
2. Export button on the tabs can be used only for those charts which support data export. (Data export of pivot table, tree map chart, etc is not supported Qlik Sense 2.1. Also, you can not export data from filters.)

## Licence
The software is provided "AS IS" without warranty of any kind. This project is licensed under the terms of the MIT license.

## Author
Masaki Hamano
