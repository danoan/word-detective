import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "production",
  entry: './src/main.js',
  output: {
    filename: 'word-detective-min.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: "module"
    }
  },
  experiments: {
    outputModule: true
  }
};
