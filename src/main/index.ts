import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
const fs = require('fs-extra')
import { exec } from 'child_process'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // IPC
  ipcMain.on('create-folder', (_event, folderPath) => {
    try {
      // 폴더 생성
      fs.ensureDir(folderPath)
      console.log(`폴더가 성공적으로 생성되었습니다: ${folderPath}`)

      // 폴더 내부로 파일 이동
      const sourceFilePath = 'resources/icon.png'
      const destinationFilePath = `${folderPath}/newIcon.png`
      fs.copy(sourceFilePath, destinationFilePath)
      console.log(`파일이 성공적으로 이동되었습니다: ${destinationFilePath}`)

      return true
    } catch (error) {
      console.error('폴더를 생성하는 동안 오류가 발생했습니다:', error)
      return false
    }
  })

  ipcMain.on('create-text-file', (_event, filePath, content) => {
    try {
      fs.outputFile(filePath, content)
      console.log(`텍스트 파일이 성공적으로 생성되었습니다: ${filePath}`)
    } catch (error) {
      console.error(`텍스트 파일을 생성하는 동안 오류가 발생했습니다: ${error}`)
    }
  })

  ipcMain.on('run-exe', (_event, filePath) => {
    console.log(filePath)

    exec(filePath, (error, stdout, stderr) => {
      if (error) {
        console.error(`명령어 실행 중 오류 발생: ${error}`)
        return
      }
      console.log(`프로세스가 종료되었습니다. stdout: ${stdout}`)
      if (stderr) {
        console.error(`stderr: ${stderr}`)
      }
    })
  })
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
