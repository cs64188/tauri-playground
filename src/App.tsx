import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { Three } from './lib/three'

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  let threeApp: Three
  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }
  useEffect(() => {
    if (!threeApp) {
      threeApp = new Three('#threeApp')
      threeApp.initMouseInteraction((object) => {
        // 在这里进行下一步的交互处理，使用传递的交互的对象
        console.log('Clicked on:', object);
      });
    }
  })

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>

      <p>{greetMsg}</p>
      <div id="threeApp" />
    </div>
  );
}

export default App;
