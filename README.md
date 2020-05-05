# Knight Maneuver
Knight maneuver game using https://github.com/ornicar/chessground/

Play online at: https://taktikspiel.com/app/knight-maneuver/

## Usage
Run `npm run build` to get the javascript file you can include in your HTML page. You will need [browserify](https://www.npmjs.com/package/browserify#install) for that.

On the HTML page you will need two divs, one for the chessboard with `id="board"` and one for the control with `id="control"`.
As this uses [chessground](https://github.com/ornicar/chessground/) you must also include the required css and svg files for that library to display the board. For example: https://taktikspiel.com/chessground/chessground.css
