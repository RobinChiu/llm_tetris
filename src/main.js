import './styles/styles.css'
// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.js'
import {setupGame} from './js/script.js'
import { setupButton } from './js/ai.js'


document.querySelector('#app').innerHTML = `
    <div class="game-container">
        <canvas id="game-board" width="300" height="600"></canvas>
        <div class="game-info">
            <h2>分數: <span id="score">0</span></h2>
            <h3>等級: <span id="level">1</span></h3>
            <div class="next-piece">
                <canvas id="next-piece" width="100" height="100"></canvas>
            </div>
            <div class="ai-controls">
                <button id="ai-toggle" class="btn btn-outline-light">啟用AI</button>
                <span id="ai-status" class="text-light">(已停用)</span>
            </div>
            <div class="controls">
                <p>控制方式:</p>
                <p>←→: 移動</p>
                <p>↑: 旋轉</p>
                <p>↓: 加速</p>
                <p>空格: 瞬間落下</p>
            </div>
        </div>
    </div>
`

setupGame(document)
setupButton(document)