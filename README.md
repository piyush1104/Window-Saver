A Firefox extension to manage your windows. Using this extension you can save your windows before closing them and open them any time later.

This project has been created using react and uses https://github.com/piyush1104/react-extension-boilerplate-redux as boilerplate.<br />
Also this extension is based on similar extension https://github.com/bit-tinker/Window-Saver. Major differences between these two are - 

- The old extension used to bookmark all the tabs. This new version just stores them in local storage.
- The old extension opened all the tabse at once. This new version opens all the tabs discarded.

Wants to build this extension yourself?

- clone this repo
- run **npm install**
- run **npm run build**.

That's it. Now in the build folder, you have your extension that you can package using **web-ext**.

PS. I used npm version - 6.14.5, node version - v12.18.1. I built this on Mac OS Catalina.

I wil update the link to firefox add on hub, once they approve my request.
