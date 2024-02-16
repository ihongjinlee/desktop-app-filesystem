export default function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const ipcHandleCreateNewFolder = (): void =>
    window.electron.ipcRenderer.send('create-folder', '/newfolder')

  return (
    <div className="flex flex-col">
      <button onClick={ipcHandle}>핑퐁 테스트</button>
      <button onClick={ipcHandleCreateNewFolder}>새 폴더 만들기</button>
    </div>
  )
}
