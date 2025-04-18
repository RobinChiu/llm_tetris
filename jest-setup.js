const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');

const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <canvas id="game-board"></canvas>
      <canvas id="next-piece"></canvas>
      <div id="score">0</div>
      <div id="level">1</div>
    </body>
  </html>
`);

global.document = dom.window.document;
global.window = dom.window;

// Mock canvas methods
HTMLCanvasElement.prototype.getContext = function() {
  return {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    canvas: {
      width: 800,
      height: 600
    }
  };
};
