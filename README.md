# Tabs for Qlik Sense
The **Tabs for Qlik Sense** is an extension which allows you to add tabs on Qlik Sense. This extension is a part of Qlik dashboard bundle, first delivered with Qlik Sense November 2018.

## Screen shot

![Alt text](./images/Demo.png)

# Get Started

## Installation
1. Download the extension zip, `qlik-tabbed-container.zip`, from the latest release (https://github.com/qlik-oss/Qlik-Sense-Tabs/releases/latest)
2. Install the extension:

    a. **Qlik Sense Desktop**: unzip to a directory under [My Documents]/Qlik/Sense/Extensions.
    
    b. **Qlik Sense Server**: import the zip file in the QMC.

## Usage
1. Open a Qlik Sense App.
2. Create charts you would like to display on the tab extension and add them to master items. (You can delete the charts after you added them to master items.)
3. Drag and drop the "Tabs" extension onto the canvas.
4. On the extension property panel, navigate to [Settings] > [Properties] and change the "Number of Tabs".
5. Select a chart on the drop-down list and modify the label for each tab on the property panel.

## Limitations
1. Right-click context menu (including take snapshot, open exploration menu, export to PDF, etc) is disabled for tabbed container.
2. Data export button on the tabs can be used only for those charts which support data export.

# Developing the extension

If you want to do code changes to the extension follow these simple steps to get going.

1. Get Qlik Sense Desktop
1. Create a new app and add qsVariable to a sheet.
2. Clone the repository
3. Run `npm install`
4. Change the path to `/dist` folder in `gulpfile.js(row 8)` to be your local extensions folder. It will be something like `C:/Users/<user>/Documents/Qlik/Sense/Extensions/qlik-tabbed-container`.
5. Run `npm run build:debug` - this command should output unminified code to the path configured in step four.

```
// Minified output to /dist folder.
$ npm run build
```

```
// Outputs a .zip file to /dist folder.
$ npm run build:zip
```

# Original Author
[Masaki Hamano](https://github.com/mhamano)

## License & Copyright
The software is made available "AS IS" without any warranty of any kind under the MIT License (MIT).

See [Additional license information for this solution.](LICENSE.md)
