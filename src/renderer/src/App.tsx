export default function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const ipcHandleCreateNewFolder = (): void =>
    window.electron.ipcRenderer.send('create-folder', '/newfolder')

  const ipcHandleCreateTextFile = (): void => {
    window.electron.ipcRenderer.send(
      'create-text-file',
      '/txt/text.txt',
      '텍스트 파일 내용\n한줄\n두줄'
    )
  }

  return (
    <div className="flex flex-col">
      <button onClick={ipcHandle}>핑퐁 테스트</button>
      <button onClick={ipcHandleCreateNewFolder}>새 폴더 만들기</button>
      <button onClick={ipcHandleCreateTextFile}>새 텍스트파일 만들기</button>
    </div>
  )
}
