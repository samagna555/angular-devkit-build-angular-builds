"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const architect_1 = require("@angular-devkit/architect");
const core_1 = require("@angular-devkit/core");
const path_1 = require("path");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const schema_1 = require("../browser/schema");
const version_1 = require("../utils/version");
const webpack_browser_config_1 = require("../utils/webpack-browser-config");
const configs_1 = require("../webpack/configs");
const single_test_transform_1 = require("../webpack/plugins/single-test-transform");
const find_tests_1 = require("./find-tests");
async function initialize(options, context, webpackConfigurationTransformer) {
    const { config } = await webpack_browser_config_1.generateBrowserWebpackConfigFromContext(
    // only two properties are missing:
    // * `outputPath` which is fixed for tests
    // * `budgets` which might be incorrect due to extra dev libs
    {
        ...options,
        outputPath: '',
        budgets: undefined,
        optimization: false,
        buildOptimizer: false,
        aot: false,
        vendorChunk: true,
        namedChunks: true,
        extractLicenses: false,
        outputHashing: schema_1.OutputHashing.None,
    }, context, wco => [
        configs_1.getCommonConfig(wco),
        configs_1.getStylesConfig(wco),
        configs_1.getTypeScriptConfig(wco),
        configs_1.getTestConfig(wco),
        configs_1.getWorkerConfig(wco),
    ]);
    const karma = await Promise.resolve().then(() => require('karma'));
    return [
        karma,
        webpackConfigurationTransformer ? await webpackConfigurationTransformer(config) : config,
    ];
}
/**
 * @experimental Direct usage of this function is considered experimental.
 */
function execute(options, context, transforms = {}) {
    // Check Angular version.
    version_1.assertCompatibleAngularVersion(context.workspaceRoot, context.logger);
    return rxjs_1.from(initialize(options, context, transforms.webpackConfiguration)).pipe(operators_1.switchMap(async ([karma, webpackConfig]) => {
        var _a;
        const karmaOptions = {};
        if (options.watch !== undefined) {
            karmaOptions.singleRun = !options.watch;
        }
        // Convert browsers from a string to an array
        if (options.browsers) {
            karmaOptions.browsers = options.browsers.split(',');
        }
        if (options.reporters) {
            // Split along commas to make it more natural, and remove empty strings.
            const reporters = options.reporters
                .reduce((acc, curr) => acc.concat(curr.split(',')), [])
                .filter(x => !!x);
            if (reporters.length > 0) {
                karmaOptions.reporters = reporters;
            }
        }
        // prepend special webpack loader that will transform test.ts
        if (options.include && options.include.length > 0) {
            const mainFilePath = core_1.getSystemPath(core_1.join(core_1.normalize(context.workspaceRoot), options.main));
            const files = find_tests_1.findTests(options.include, path_1.dirname(mainFilePath), context.workspaceRoot);
            // early exit, no reason to start karma
            if (!files.length) {
                throw new Error(`Specified patterns: "${options.include.join(', ')}" did not match any spec files.`);
            }
            // Get the rules and ensure the Webpack configuration is setup properly
            const rules = ((_a = webpackConfig.module) === null || _a === void 0 ? void 0 : _a.rules) || [];
            if (!webpackConfig.module) {
                webpackConfig.module = { rules };
            }
            else if (!webpackConfig.module.rules) {
                webpackConfig.module.rules = rules;
            }
            rules.unshift({
                test: mainFilePath,
                use: {
                    // cannot be a simple path as it differs between environments
                    loader: single_test_transform_1.SingleTestTransformLoader,
                    options: {
                        files,
                        logger: context.logger,
                    },
                },
            });
        }
        karmaOptions.buildWebpack = {
            options,
            webpackConfig,
            logger: context.logger,
        };
        const config = await karma.config.parseConfig(path_1.resolve(context.workspaceRoot, options.karmaConfig), transforms.karmaOptions ? transforms.karmaOptions(karmaOptions) : karmaOptions, { promiseConfig: true, throwErrors: true });
        return [karma, config];
    }), operators_1.switchMap(([karma, karmaConfig]) => new rxjs_1.Observable(subscriber => {
        var _a, _b, _c;
        var _d, _e;
        // Pass onto Karma to emit BuildEvents.
        (_a = karmaConfig.buildWebpack) !== null && _a !== void 0 ? _a : (karmaConfig.buildWebpack = {});
        if (typeof karmaConfig.buildWebpack === 'object') {
            // tslint:disable-next-line: no-any
            (_b = (_d = karmaConfig.buildWebpack).failureCb) !== null && _b !== void 0 ? _b : (_d.failureCb = () => subscriber.next({ success: false }));
            // tslint:disable-next-line: no-any
            (_c = (_e = karmaConfig.buildWebpack).successCb) !== null && _c !== void 0 ? _c : (_e.successCb = () => subscriber.next({ success: true }));
        }
        // Complete the observable once the Karma server returns.
        const karmaServer = new karma.Server(karmaConfig, exitCode => {
            subscriber.next({ success: exitCode === 0 });
            subscriber.complete();
        });
        const karmaStart = karmaServer.start();
        // Cleanup, signal Karma to exit.
        return () => karmaStart.then(() => karmaServer.stop());
    })), operators_1.defaultIfEmpty({ success: false }));
}
exports.execute = execute;
exports.default = architect_1.createBuilder(execute);
