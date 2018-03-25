const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

//SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//Listen for the app to be ready
app.on('ready', function(){
	//Create Window
	mainWindow = new BrowserWindow({});
	//Load html into window
	//file://dirname/mainWindow.html
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'mainWindow.html'),
		protocol: 'file:',
		slashes: true
	}));

	//Quit app when closed
	mainWindow.on('closed', function(){
		app.quit();
	})

	//Build menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	//Insert Menu
	Menu.setApplicationMenu(mainMenu);
});

//Handle create add window
function createAddWindow(){
	//Create Window
	addWindow = new BrowserWindow({
		width: 300,
		height: 200,
		title: 'Add Shopping List Item'
	});
	//Load html into window
	//file://dirname/mainWindow.html
	addWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'addWindow.html'),
		protocol: 'file:',
		slashes: true
	}));
	//Garbage collection handle
	addWindow.on('close', function(){
		addWindow = null;
	});
}

//Catch item:add
ipcMain.on('item:add', function(e, item){
	console.log(item);
	mainWindow.webContents.send('item:add', item);
	addWindow.close();
});

//Create menu template
const mainMenuTemplate = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Add Item',
				click(){
					createAddWindow();
				}
			},
			{
				label: 'Clear Items',
				click(){
					mainWindow.webContents.send('item:clear');
				}
			},
			{
				label: 'Quit',
				accelerator: process.platform == 'linux' ? 'Ctrl+Q' : 'Command+Q',
				click(){
					app.quit();
				}
			}
		]
	}
];

//If MAC, add empty object to menu
if(process.platform == 'darwin'){
	mainMenuTemplate.unshift({});
}

//Add developer tools item if not in production
if(process.env.NODE_ENV !== 'production'){
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu: [
			{
				label: 'Toggle DevTools',
				accelerator: process.platform == 'linux' ? 'Ctrl+I' : 'Command+I',
				click(){
					app.quit();
				},
				click(item, focusedWindow){
					focusedWindow.toggleDevTools();
				}
			},
			{
				role: 'reload'
			}
		]
	});
}