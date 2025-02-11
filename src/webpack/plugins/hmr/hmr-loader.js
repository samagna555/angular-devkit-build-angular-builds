"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HmrLoader = void 0;
const path_1 = require("path");
exports.HmrLoader = __filename;
const hmrAcceptPath = (0, path_1.join)(__dirname, './hmr-accept.js').replace(/\\/g, '/');
function default_1(content, 
// Source map types are broken in the webpack type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
map) {
    const source = `${content}

  // HMR Accept Code
  import ngHmrAccept from '${hmrAcceptPath}';
  ngHmrAccept(module);
  `;
    this.callback(null, source, map);
    return;
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG1yLWxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL3dlYnBhY2svcGx1Z2lucy9obXIvaG1yLWxvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQkFBNEI7QUFFZixRQUFBLFNBQVMsR0FBRyxVQUFVLENBQUM7QUFDcEMsTUFBTSxhQUFhLEdBQUcsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUU3RSxtQkFHRSxPQUFlO0FBQ2YsOERBQThEO0FBQzlELDhEQUE4RDtBQUM5RCxHQUFRO0lBRVIsTUFBTSxNQUFNLEdBQUcsR0FBRyxPQUFPOzs7NkJBR0UsYUFBYTs7R0FFdkMsQ0FBQztJQUVGLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUVqQyxPQUFPO0FBQ1QsQ0FBQztBQWxCRCw0QkFrQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgY29uc3QgSG1yTG9hZGVyID0gX19maWxlbmFtZTtcbmNvbnN0IGhtckFjY2VwdFBhdGggPSBqb2luKF9fZGlybmFtZSwgJy4vaG1yLWFjY2VwdC5qcycpLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICB0aGlzOiBhbnksXG4gIGNvbnRlbnQ6IHN0cmluZyxcbiAgLy8gU291cmNlIG1hcCB0eXBlcyBhcmUgYnJva2VuIGluIHRoZSB3ZWJwYWNrIHR5cGUgZGVmaW5pdGlvbnNcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgbWFwOiBhbnksXG4pOiB2b2lkIHtcbiAgY29uc3Qgc291cmNlID0gYCR7Y29udGVudH1cblxuICAvLyBITVIgQWNjZXB0IENvZGVcbiAgaW1wb3J0IG5nSG1yQWNjZXB0IGZyb20gJyR7aG1yQWNjZXB0UGF0aH0nO1xuICBuZ0htckFjY2VwdChtb2R1bGUpO1xuICBgO1xuXG4gIHRoaXMuY2FsbGJhY2sobnVsbCwgc291cmNlLCBtYXApO1xuXG4gIHJldHVybjtcbn1cbiJdfQ==