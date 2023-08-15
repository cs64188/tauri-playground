import { useEffect } from "react";
import "./App.css";
import { Three } from './lib/three'

function App() {
  let threeApp: Three
  useEffect(() => {
    if (!threeApp) {
      threeApp = new Three('#threeApp')
      threeApp.initMouseInteraction((object) => {
        // 在这里进行下一步的交互处理，使用传递的交互的对象
        console.log('Clicked on:', object);
      });
    }
  })
  function handleFileInputChange (event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) {
      return;
    }
    const file = event.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file)
      console.log('fileUrl is', fileUrl)
      threeApp.loadModel(
        fileUrl, // 替换成实际的模型 URL
        (progress) => {
          // 提取加载进度信息并处理
          if (progress.lengthComputable) {
            const percentComplete = (progress.loaded / progress.total) * 100;
            console.log('Loading progress:', percentComplete.toFixed(2) + '%');
          } else {
            console.log('Loading progress:', 'unknown');
          }
        },
        () => {
          // 加载完成回调，您可以在这里执行一些操作
          console.log('Model loaded.');
        }
      );
    }
  }

  return (
    <div className="container">
      <button onClick={() => window.location.reload()}>重置刷新</button>
      <h1>Welcome to Threejs.</h1>

      <p>点击上传模型文件.</p>

      <form className="row">
        <input onChange={(e) => handleFileInputChange(e)} placeholder="Enter a name..." type="file" />
      </form>

      <div id="threeApp" />
    </div>
  );
}

export default App;
