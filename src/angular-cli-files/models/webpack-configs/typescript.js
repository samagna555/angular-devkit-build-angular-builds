"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// tslint:disable
// TODO: cleanup this file, it's copied as is from Angular CLI.
const path = require("path");
const webpack_1 = require("@ngtools/webpack");
const common_1 = require("./common");
function _createAotPlugin(wco, options, useMain = true, extract = false) {
    const { root, buildOptions } = wco;
    options.compilerOptions = options.compilerOptions || {};
    if (wco.buildOptions.preserveSymlinks) {
        options.compilerOptions.preserveSymlinks = true;
    }
    let i18nInFile = buildOptions.i18nFile
        ? path.resolve(root, buildOptions.i18nFile)
        : undefined;
    const i18nFileAndFormat = extract
        ? {
            i18nOutFile: buildOptions.i18nFile,
            i18nOutFormat: buildOptions.i18nFormat,
        } : {
        i18nInFile: i18nInFile,
        i18nInFormat: buildOptions.i18nFormat,
    };
    const additionalLazyModules = {};
    if (buildOptions.lazyModules) {
        for (const lazyModule of buildOptions.lazyModules) {
            additionalLazyModules[lazyModule] = path.resolve(root, lazyModule);
        }
    }
    const hostReplacementPaths = {};
    if (buildOptions.fileReplacements) {
        for (const replacement of buildOptions.fileReplacements) {
            hostReplacementPaths[replacement.replace] = replacement.with;
        }
    }
    const pluginOptions = Object.assign({ mainPath: useMain ? path.join(root, buildOptions.main) : undefined }, i18nFileAndFormat, { locale: buildOptions.i18nLocale, platform: buildOptions.platform === 'server' ? webpack_1.PLATFORM.Server : webpack_1.PLATFORM.Browser, missingTranslation: buildOptions.i18nMissingTranslation, sourceMap: buildOptions.sourceMap.scripts, additionalLazyModules,
        hostReplacementPaths, nameLazyFiles: buildOptions.namedChunks, forkTypeChecker: buildOptions.forkTypeChecker, contextElementDependencyConstructor: require('webpack/lib/dependencies/ContextElementDependency'), logger: wco.logger, directTemplateLoading: true }, options);
    return new webpack_1.AngularCompilerPlugin(pluginOptions);
}
function getNonAotConfig(wco) {
    const { tsConfigPath } = wco;
    return {
        module: { rules: [{ test: /\.tsx?$/, loader: webpack_1.NgToolsLoader }] },
        plugins: [_createAotPlugin(wco, { tsConfigPath, skipCodeGeneration: true })]
    };
}
exports.getNonAotConfig = getNonAotConfig;
function getAotConfig(wco, extract = false) {
    const { tsConfigPath, buildOptions } = wco;
    const loaders = [webpack_1.NgToolsLoader];
    if (buildOptions.buildOptimizer) {
        loaders.unshift({
            loader: common_1.buildOptimizerLoader,
            options: { sourceMap: buildOptions.sourceMap.scripts }
        });
    }
    const test = /(?:\.ngfactory\.js|\.ngstyle\.js|\.tsx?)$/;
    return {
        module: { rules: [{ test, use: loaders }] },
        plugins: [_createAotPlugin(wco, { tsConfigPath }, true, extract)]
    };
}
exports.getAotConfig = getAotConfig;
