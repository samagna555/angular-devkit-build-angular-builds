"use strict";
// THIS FILE IS AUTOMATICALLY GENERATED. TO UPDATE THIS FILE YOU NEED TO CHANGE THE
// CORRESPONDING JSON SCHEMA FILE, THEN RUN devkit-admin build (or bazel build ...).
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineStyleLanguage = void 0;
/**
 * The stylesheet language to use for the application's inline component styles.
 */
var InlineStyleLanguage;
(function (InlineStyleLanguage) {
    InlineStyleLanguage["Css"] = "css";
    InlineStyleLanguage["Less"] = "less";
    InlineStyleLanguage["Sass"] = "sass";
    InlineStyleLanguage["Scss"] = "scss";
})(InlineStyleLanguage = exports.InlineStyleLanguage || (exports.InlineStyleLanguage = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci9zcmMvYnVpbGRlcnMva2FybWEvc2NoZW1hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxtRkFBbUY7QUFDbkYsb0ZBQW9GOzs7QUErSHBGOztHQUVHO0FBQ0gsSUFBWSxtQkFLWDtBQUxELFdBQVksbUJBQW1CO0lBQzNCLGtDQUFXLENBQUE7SUFDWCxvQ0FBYSxDQUFBO0lBQ2Isb0NBQWEsQ0FBQTtJQUNiLG9DQUFhLENBQUE7QUFDakIsQ0FBQyxFQUxXLG1CQUFtQixHQUFuQiwyQkFBbUIsS0FBbkIsMkJBQW1CLFFBSzlCIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBUSElTIEZJTEUgSVMgQVVUT01BVElDQUxMWSBHRU5FUkFURUQuIFRPIFVQREFURSBUSElTIEZJTEUgWU9VIE5FRUQgVE8gQ0hBTkdFIFRIRVxuLy8gQ09SUkVTUE9ORElORyBKU09OIFNDSEVNQSBGSUxFLCBUSEVOIFJVTiBkZXZraXQtYWRtaW4gYnVpbGQgKG9yIGJhemVsIGJ1aWxkIC4uLikuXG5cbi8qKlxuICogS2FybWEgdGFyZ2V0IG9wdGlvbnMgZm9yIEJ1aWxkIEZhY2FkZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTY2hlbWEge1xuICAgIC8qKlxuICAgICAqIExpc3Qgb2Ygc3RhdGljIGFwcGxpY2F0aW9uIGFzc2V0cy5cbiAgICAgKi9cbiAgICBhc3NldHM/OiBBc3NldFBhdHRlcm5bXTtcbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSB3aGljaCBicm93c2VycyB0ZXN0cyBhcmUgcnVuIGFnYWluc3QuXG4gICAgICovXG4gICAgYnJvd3NlcnM/OiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogT3V0cHV0IGEgY29kZSBjb3ZlcmFnZSByZXBvcnQuXG4gICAgICovXG4gICAgY29kZUNvdmVyYWdlPzogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiBHbG9icyB0byBleGNsdWRlIGZyb20gY29kZSBjb3ZlcmFnZS5cbiAgICAgKi9cbiAgICBjb2RlQ292ZXJhZ2VFeGNsdWRlPzogc3RyaW5nW107XG4gICAgLyoqXG4gICAgICogUmVwbGFjZSBjb21waWxhdGlvbiBzb3VyY2UgZmlsZXMgd2l0aCBvdGhlciBjb21waWxhdGlvbiBzb3VyY2UgZmlsZXMgaW4gdGhlIGJ1aWxkLlxuICAgICAqL1xuICAgIGZpbGVSZXBsYWNlbWVudHM/OiBGaWxlUmVwbGFjZW1lbnRbXTtcbiAgICAvKipcbiAgICAgKiBHbG9icyBvZiBmaWxlcyB0byBpbmNsdWRlLCByZWxhdGl2ZSB0byB3b3Jrc3BhY2Ugb3IgcHJvamVjdCByb290LlxuICAgICAqIFRoZXJlIGFyZSAyIHNwZWNpYWwgY2FzZXM6XG4gICAgICogLSB3aGVuIGEgcGF0aCB0byBkaXJlY3RvcnkgaXMgcHJvdmlkZWQsIGFsbCBzcGVjIGZpbGVzIGVuZGluZyBcIi5zcGVjLkAodHN8dHN4KVwiIHdpbGwgYmVcbiAgICAgKiBpbmNsdWRlZFxuICAgICAqIC0gd2hlbiBhIHBhdGggdG8gYSBmaWxlIGlzIHByb3ZpZGVkLCBhbmQgYSBtYXRjaGluZyBzcGVjIGZpbGUgZXhpc3RzIGl0IHdpbGwgYmUgaW5jbHVkZWRcbiAgICAgKiBpbnN0ZWFkXG4gICAgICovXG4gICAgaW5jbHVkZT86IHN0cmluZ1tdO1xuICAgIC8qKlxuICAgICAqIFRoZSBzdHlsZXNoZWV0IGxhbmd1YWdlIHRvIHVzZSBmb3IgdGhlIGFwcGxpY2F0aW9uJ3MgaW5saW5lIGNvbXBvbmVudCBzdHlsZXMuXG4gICAgICovXG4gICAgaW5saW5lU3R5bGVMYW5ndWFnZT86IElubGluZVN0eWxlTGFuZ3VhZ2U7XG4gICAgLyoqXG4gICAgICogVGhlIG5hbWUgb2YgdGhlIEthcm1hIGNvbmZpZ3VyYXRpb24gZmlsZS5cbiAgICAgKi9cbiAgICBrYXJtYUNvbmZpZzogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIFRoZSBuYW1lIG9mIHRoZSBtYWluIGVudHJ5LXBvaW50IGZpbGUuXG4gICAgICovXG4gICAgbWFpbjogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIEVuYWJsZSBhbmQgZGVmaW5lIHRoZSBmaWxlIHdhdGNoaW5nIHBvbGwgdGltZSBwZXJpb2QgaW4gbWlsbGlzZWNvbmRzLlxuICAgICAqL1xuICAgIHBvbGw/OiBudW1iZXI7XG4gICAgLyoqXG4gICAgICogVGhlIG5hbWUgb2YgdGhlIHBvbHlmaWxscyBmaWxlLlxuICAgICAqL1xuICAgIHBvbHlmaWxscz86IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBEbyBub3QgdXNlIHRoZSByZWFsIHBhdGggd2hlbiByZXNvbHZpbmcgbW9kdWxlcy4gSWYgdW5zZXQgdGhlbiB3aWxsIGRlZmF1bHQgdG8gYHRydWVgIGlmXG4gICAgICogTm9kZUpTIG9wdGlvbiAtLXByZXNlcnZlLXN5bWxpbmtzIGlzIHNldC5cbiAgICAgKi9cbiAgICBwcmVzZXJ2ZVN5bWxpbmtzPzogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiBMb2cgcHJvZ3Jlc3MgdG8gdGhlIGNvbnNvbGUgd2hpbGUgYnVpbGRpbmcuXG4gICAgICovXG4gICAgcHJvZ3Jlc3M/OiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIEthcm1hIHJlcG9ydGVycyB0byB1c2UuIERpcmVjdGx5IHBhc3NlZCB0byB0aGUga2FybWEgcnVubmVyLlxuICAgICAqL1xuICAgIHJlcG9ydGVycz86IHN0cmluZ1tdO1xuICAgIC8qKlxuICAgICAqIEdsb2JhbCBzY3JpcHRzIHRvIGJlIGluY2x1ZGVkIGluIHRoZSBidWlsZC5cbiAgICAgKi9cbiAgICBzY3JpcHRzPzogU2NyaXB0RWxlbWVudFtdO1xuICAgIC8qKlxuICAgICAqIE91dHB1dCBzb3VyY2UgbWFwcyBmb3Igc2NyaXB0cyBhbmQgc3R5bGVzLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiwgc2VlXG4gICAgICogaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3dvcmtzcGFjZS1jb25maWcjc291cmNlLW1hcC1jb25maWd1cmF0aW9uLlxuICAgICAqL1xuICAgIHNvdXJjZU1hcD86IFNvdXJjZU1hcFVuaW9uO1xuICAgIC8qKlxuICAgICAqIE9wdGlvbnMgdG8gcGFzcyB0byBzdHlsZSBwcmVwcm9jZXNzb3JzXG4gICAgICovXG4gICAgc3R5bGVQcmVwcm9jZXNzb3JPcHRpb25zPzogU3R5bGVQcmVwcm9jZXNzb3JPcHRpb25zO1xuICAgIC8qKlxuICAgICAqIEdsb2JhbCBzdHlsZXMgdG8gYmUgaW5jbHVkZWQgaW4gdGhlIGJ1aWxkLlxuICAgICAqL1xuICAgIHN0eWxlcz86IFN0eWxlRWxlbWVudFtdO1xuICAgIC8qKlxuICAgICAqIFRoZSBuYW1lIG9mIHRoZSBUeXBlU2NyaXB0IGNvbmZpZ3VyYXRpb24gZmlsZS5cbiAgICAgKi9cbiAgICB0c0NvbmZpZzogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIFJ1biBidWlsZCB3aGVuIGZpbGVzIGNoYW5nZS5cbiAgICAgKi9cbiAgICB3YXRjaD86IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICogVHlwZVNjcmlwdCBjb25maWd1cmF0aW9uIGZvciBXZWIgV29ya2VyIG1vZHVsZXMuXG4gICAgICovXG4gICAgd2ViV29ya2VyVHNDb25maWc/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIEFzc2V0UGF0dGVybiA9IEFzc2V0UGF0dGVybkNsYXNzIHwgc3RyaW5nO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFzc2V0UGF0dGVybkNsYXNzIHtcbiAgICAvKipcbiAgICAgKiBUaGUgcGF0dGVybiB0byBtYXRjaC5cbiAgICAgKi9cbiAgICBnbG9iOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogQW4gYXJyYXkgb2YgZ2xvYnMgdG8gaWdub3JlLlxuICAgICAqL1xuICAgIGlnbm9yZT86IHN0cmluZ1tdO1xuICAgIC8qKlxuICAgICAqIFRoZSBpbnB1dCBkaXJlY3RvcnkgcGF0aCBpbiB3aGljaCB0byBhcHBseSAnZ2xvYicuIERlZmF1bHRzIHRvIHRoZSBwcm9qZWN0IHJvb3QuXG4gICAgICovXG4gICAgaW5wdXQ6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBwYXRoIHdpdGhpbiB0aGUgb3V0cHV0LlxuICAgICAqL1xuICAgIG91dHB1dDogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVSZXBsYWNlbWVudCB7XG4gICAgcmVwbGFjZT86ICAgICBzdHJpbmc7XG4gICAgcmVwbGFjZVdpdGg/OiBzdHJpbmc7XG4gICAgc3JjPzogICAgICAgICBzdHJpbmc7XG4gICAgd2l0aD86ICAgICAgICBzdHJpbmc7XG59XG5cbi8qKlxuICogVGhlIHN0eWxlc2hlZXQgbGFuZ3VhZ2UgdG8gdXNlIGZvciB0aGUgYXBwbGljYXRpb24ncyBpbmxpbmUgY29tcG9uZW50IHN0eWxlcy5cbiAqL1xuZXhwb3J0IGVudW0gSW5saW5lU3R5bGVMYW5ndWFnZSB7XG4gICAgQ3NzID0gXCJjc3NcIixcbiAgICBMZXNzID0gXCJsZXNzXCIsXG4gICAgU2FzcyA9IFwic2Fzc1wiLFxuICAgIFNjc3MgPSBcInNjc3NcIixcbn1cblxuZXhwb3J0IHR5cGUgU2NyaXB0RWxlbWVudCA9IFNjcmlwdENsYXNzIHwgc3RyaW5nO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNjcmlwdENsYXNzIHtcbiAgICAvKipcbiAgICAgKiBUaGUgYnVuZGxlIG5hbWUgZm9yIHRoaXMgZXh0cmEgZW50cnkgcG9pbnQuXG4gICAgICovXG4gICAgYnVuZGxlTmFtZT86IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBJZiB0aGUgYnVuZGxlIHdpbGwgYmUgcmVmZXJlbmNlZCBpbiB0aGUgSFRNTCBmaWxlLlxuICAgICAqL1xuICAgIGluamVjdD86IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICogVGhlIGZpbGUgdG8gaW5jbHVkZS5cbiAgICAgKi9cbiAgICBpbnB1dDogc3RyaW5nO1xufVxuXG4vKipcbiAqIE91dHB1dCBzb3VyY2UgbWFwcyBmb3Igc2NyaXB0cyBhbmQgc3R5bGVzLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiwgc2VlXG4gKiBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvd29ya3NwYWNlLWNvbmZpZyNzb3VyY2UtbWFwLWNvbmZpZ3VyYXRpb24uXG4gKi9cbmV4cG9ydCB0eXBlIFNvdXJjZU1hcFVuaW9uID0gYm9vbGVhbiB8IFNvdXJjZU1hcENsYXNzO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNvdXJjZU1hcENsYXNzIHtcbiAgICAvKipcbiAgICAgKiBPdXRwdXQgc291cmNlIG1hcHMgZm9yIGFsbCBzY3JpcHRzLlxuICAgICAqL1xuICAgIHNjcmlwdHM/OiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIE91dHB1dCBzb3VyY2UgbWFwcyBmb3IgYWxsIHN0eWxlcy5cbiAgICAgKi9cbiAgICBzdHlsZXM/OiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIFJlc29sdmUgdmVuZG9yIHBhY2thZ2VzIHNvdXJjZSBtYXBzLlxuICAgICAqL1xuICAgIHZlbmRvcj86IGJvb2xlYW47XG59XG5cbi8qKlxuICogT3B0aW9ucyB0byBwYXNzIHRvIHN0eWxlIHByZXByb2Nlc3NvcnNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdHlsZVByZXByb2Nlc3Nvck9wdGlvbnMge1xuICAgIC8qKlxuICAgICAqIFBhdGhzIHRvIGluY2x1ZGUuIFBhdGhzIHdpbGwgYmUgcmVzb2x2ZWQgdG8gd29ya3NwYWNlIHJvb3QuXG4gICAgICovXG4gICAgaW5jbHVkZVBhdGhzPzogc3RyaW5nW107XG59XG5cbmV4cG9ydCB0eXBlIFN0eWxlRWxlbWVudCA9IFN0eWxlQ2xhc3MgfCBzdHJpbmc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3R5bGVDbGFzcyB7XG4gICAgLyoqXG4gICAgICogVGhlIGJ1bmRsZSBuYW1lIGZvciB0aGlzIGV4dHJhIGVudHJ5IHBvaW50LlxuICAgICAqL1xuICAgIGJ1bmRsZU5hbWU/OiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogSWYgdGhlIGJ1bmRsZSB3aWxsIGJlIHJlZmVyZW5jZWQgaW4gdGhlIEhUTUwgZmlsZS5cbiAgICAgKi9cbiAgICBpbmplY3Q/OiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIFRoZSBmaWxlIHRvIGluY2x1ZGUuXG4gICAgICovXG4gICAgaW5wdXQ6IHN0cmluZztcbn1cbiJdfQ==