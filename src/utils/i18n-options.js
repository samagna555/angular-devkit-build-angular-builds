"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTranslations = exports.configureI18nBuild = exports.createI18nOptions = void 0;
const core_1 = require("@angular-devkit/core");
const fs_1 = __importDefault(require("fs"));
const module_1 = __importDefault(require("module"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const schema_1 = require("../builders/browser/schema");
const read_tsconfig_1 = require("../utils/read-tsconfig");
const load_translations_1 = require("./load-translations");
/**
 * The base module location used to search for locale specific data.
 */
const LOCALE_DATA_BASE_MODULE = '@angular/common/locales/global';
function normalizeTranslationFileOption(option, locale, expectObjectInError) {
    if (typeof option === 'string') {
        return [option];
    }
    if (Array.isArray(option) && option.every((element) => typeof element === 'string')) {
        return option;
    }
    let errorMessage = `Project i18n locales translation field value for '${locale}' is malformed. `;
    if (expectObjectInError) {
        errorMessage += 'Expected a string, array of strings, or object.';
    }
    else {
        errorMessage += 'Expected a string or array of strings.';
    }
    throw new Error(errorMessage);
}
function createI18nOptions(metadata, inline) {
    if (metadata.i18n !== undefined && !core_1.json.isJsonObject(metadata.i18n)) {
        throw new Error('Project i18n field is malformed. Expected an object.');
    }
    metadata = metadata.i18n || {};
    const i18n = {
        inlineLocales: new Set(),
        // en-US is the default locale added to Angular applications (https://angular.io/guide/i18n#i18n-pipes)
        sourceLocale: 'en-US',
        locales: {},
        get shouldInline() {
            return this.inlineLocales.size > 0;
        },
    };
    let rawSourceLocale;
    let rawSourceLocaleBaseHref;
    if (core_1.json.isJsonObject(metadata.sourceLocale)) {
        rawSourceLocale = metadata.sourceLocale.code;
        if (metadata.sourceLocale.baseHref !== undefined &&
            typeof metadata.sourceLocale.baseHref !== 'string') {
            throw new Error('Project i18n sourceLocale baseHref field is malformed. Expected a string.');
        }
        rawSourceLocaleBaseHref = metadata.sourceLocale.baseHref;
    }
    else {
        rawSourceLocale = metadata.sourceLocale;
    }
    if (rawSourceLocale !== undefined) {
        if (typeof rawSourceLocale !== 'string') {
            throw new Error('Project i18n sourceLocale field is malformed. Expected a string.');
        }
        i18n.sourceLocale = rawSourceLocale;
        i18n.hasDefinedSourceLocale = true;
    }
    i18n.locales[i18n.sourceLocale] = {
        files: [],
        baseHref: rawSourceLocaleBaseHref,
    };
    if (metadata.locales !== undefined && !core_1.json.isJsonObject(metadata.locales)) {
        throw new Error('Project i18n locales field is malformed. Expected an object.');
    }
    else if (metadata.locales) {
        for (const [locale, options] of Object.entries(metadata.locales)) {
            let translationFiles;
            let baseHref;
            if (core_1.json.isJsonObject(options)) {
                translationFiles = normalizeTranslationFileOption(options.translation, locale, false);
                if (typeof options.baseHref === 'string') {
                    baseHref = options.baseHref;
                }
            }
            else {
                translationFiles = normalizeTranslationFileOption(options, locale, true);
            }
            if (locale === i18n.sourceLocale) {
                throw new Error(`An i18n locale ('${locale}') cannot both be a source locale and provide a translation.`);
            }
            i18n.locales[locale] = {
                files: translationFiles.map((file) => ({ path: file })),
                baseHref,
            };
        }
    }
    if (inline === true) {
        i18n.inlineLocales.add(i18n.sourceLocale);
        Object.keys(i18n.locales).forEach((locale) => i18n.inlineLocales.add(locale));
    }
    else if (inline) {
        for (const locale of inline) {
            if (!i18n.locales[locale] && i18n.sourceLocale !== locale) {
                throw new Error(`Requested locale '${locale}' is not defined for the project.`);
            }
            i18n.inlineLocales.add(locale);
        }
    }
    return i18n;
}
exports.createI18nOptions = createI18nOptions;
async function configureI18nBuild(context, options) {
    if (!context.target) {
        throw new Error('The builder requires a target.');
    }
    const buildOptions = { ...options };
    const tsConfig = await (0, read_tsconfig_1.readTsconfig)(buildOptions.tsConfig, context.workspaceRoot);
    const metadata = await context.getProjectMetadata(context.target);
    const i18n = createI18nOptions(metadata, buildOptions.localize);
    // No additional processing needed if no inlining requested and no source locale defined.
    if (!i18n.shouldInline && !i18n.hasDefinedSourceLocale) {
        return { buildOptions, i18n };
    }
    const projectRoot = path_1.default.join(context.workspaceRoot, metadata.root || '');
    // The trailing slash is required to signal that the path is a directory and not a file.
    const projectRequire = module_1.default.createRequire(projectRoot + '/');
    const localeResolver = (locale) => projectRequire.resolve(path_1.default.join(LOCALE_DATA_BASE_MODULE, locale));
    // Load locale data and translations (if present)
    let loader;
    const usedFormats = new Set();
    for (const [locale, desc] of Object.entries(i18n.locales)) {
        if (!i18n.inlineLocales.has(locale) && locale !== i18n.sourceLocale) {
            continue;
        }
        let localeDataPath = findLocaleDataPath(locale, localeResolver);
        if (!localeDataPath) {
            const [first] = locale.split('-');
            if (first) {
                localeDataPath = findLocaleDataPath(first.toLowerCase(), localeResolver);
                if (localeDataPath) {
                    context.logger.warn(`Locale data for '${locale}' cannot be found.  Using locale data for '${first}'.`);
                }
            }
        }
        if (!localeDataPath) {
            context.logger.warn(`Locale data for '${locale}' cannot be found.  No locale data will be included for this locale.`);
        }
        else {
            desc.dataPath = localeDataPath;
        }
        if (!desc.files.length) {
            continue;
        }
        loader !== null && loader !== void 0 ? loader : (loader = await (0, load_translations_1.createTranslationLoader)());
        loadTranslations(locale, desc, context.workspaceRoot, loader, {
            warn(message) {
                context.logger.warn(message);
            },
            error(message) {
                throw new Error(message);
            },
        }, usedFormats, buildOptions.i18nDuplicateTranslation);
        if (usedFormats.size > 1 && tsConfig.options.enableI18nLegacyMessageIdFormat !== false) {
            // This limitation is only for legacy message id support (defaults to true as of 9.0)
            throw new Error('Localization currently only supports using one type of translation file format for the entire application.');
        }
    }
    // If inlining store the output in a temporary location to facilitate post-processing
    if (i18n.shouldInline) {
        const tempPath = fs_1.default.mkdtempSync(path_1.default.join(fs_1.default.realpathSync(os_1.default.tmpdir()), 'angular-cli-i18n-'));
        buildOptions.outputPath = tempPath;
        process.on('exit', () => deleteTempDirectory(tempPath));
        process.once('SIGINT', () => {
            deleteTempDirectory(tempPath);
            // Needed due to `ora` as otherwise process will not terminate.
            process.kill(process.pid, 'SIGINT');
        });
    }
    return { buildOptions, i18n };
}
exports.configureI18nBuild = configureI18nBuild;
function findLocaleDataPath(locale, resolver) {
    // Remove private use subtags
    const scrubbedLocale = locale.replace(/-x(-[a-zA-Z0-9]{1,8})+$/, '');
    try {
        return resolver(scrubbedLocale);
    }
    catch (_a) {
        if (scrubbedLocale === 'en-US') {
            // fallback to known existing en-US locale data as of 9.0
            return findLocaleDataPath('en-US-POSIX', resolver);
        }
        return null;
    }
}
/** Remove temporary directory used for i18n processing. */
function deleteTempDirectory(tempPath) {
    // The below should be removed and replaced with just `rmSync` when support for Node.Js 12 is removed.
    const { rmSync, rmdirSync } = fs_1.default;
    try {
        if (rmSync) {
            rmSync(tempPath, { force: true, recursive: true, maxRetries: 3 });
        }
        else {
            rmdirSync(tempPath, { recursive: true, maxRetries: 3 });
        }
    }
    catch (_a) { }
}
function loadTranslations(locale, desc, workspaceRoot, loader, logger, usedFormats, duplicateTranslation) {
    let translations = undefined;
    for (const file of desc.files) {
        const loadResult = loader(path_1.default.join(workspaceRoot, file.path));
        for (const diagnostics of loadResult.diagnostics.messages) {
            if (diagnostics.type === 'error') {
                logger.error(`Error parsing translation file '${file.path}': ${diagnostics.message}`);
            }
            else {
                logger.warn(`WARNING [${file.path}]: ${diagnostics.message}`);
            }
        }
        if (loadResult.locale !== undefined && loadResult.locale !== locale) {
            logger.warn(`WARNING [${file.path}]: File target locale ('${loadResult.locale}') does not match configured locale ('${locale}')`);
        }
        usedFormats === null || usedFormats === void 0 ? void 0 : usedFormats.add(loadResult.format);
        file.format = loadResult.format;
        file.integrity = loadResult.integrity;
        if (translations) {
            // Merge translations
            for (const [id, message] of Object.entries(loadResult.translations)) {
                if (translations[id] !== undefined) {
                    const duplicateTranslationMessage = `[${file.path}]: Duplicate translations for message '${id}' when merging.`;
                    switch (duplicateTranslation) {
                        case schema_1.I18NTranslation.Ignore:
                            break;
                        case schema_1.I18NTranslation.Error:
                            logger.error(`ERROR ${duplicateTranslationMessage}`);
                            break;
                        case schema_1.I18NTranslation.Warning:
                        default:
                            logger.warn(`WARNING ${duplicateTranslationMessage}`);
                            break;
                    }
                }
                translations[id] = message;
            }
        }
        else {
            // First or only translation file
            translations = loadResult.translations;
        }
    }
    desc.translation = translations;
}
exports.loadTranslations = loadTranslations;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bi1vcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci9zcmMvdXRpbHMvaTE4bi1vcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7OztBQUdILCtDQUE0QztBQUM1Qyw0Q0FBb0I7QUFDcEIsb0RBQTRCO0FBQzVCLDRDQUFvQjtBQUNwQixnREFBd0I7QUFDeEIsdURBQTZGO0FBRTdGLDBEQUFzRDtBQUN0RCwyREFBaUY7QUFFakY7O0dBRUc7QUFDSCxNQUFNLHVCQUF1QixHQUFHLGdDQUFnQyxDQUFDO0FBc0JqRSxTQUFTLDhCQUE4QixDQUNyQyxNQUFzQixFQUN0QixNQUFjLEVBQ2QsbUJBQTRCO0lBRTVCLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO1FBQzlCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNqQjtJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLE9BQU8sS0FBSyxRQUFRLENBQUMsRUFBRTtRQUNuRixPQUFPLE1BQWtCLENBQUM7S0FDM0I7SUFFRCxJQUFJLFlBQVksR0FBRyxxREFBcUQsTUFBTSxrQkFBa0IsQ0FBQztJQUNqRyxJQUFJLG1CQUFtQixFQUFFO1FBQ3ZCLFlBQVksSUFBSSxpREFBaUQsQ0FBQztLQUNuRTtTQUFNO1FBQ0wsWUFBWSxJQUFJLHdDQUF3QyxDQUFDO0tBQzFEO0lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRUQsU0FBZ0IsaUJBQWlCLENBQy9CLFFBQXlCLEVBQ3pCLE1BQTJCO0lBRTNCLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksQ0FB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QVksQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUM7YUFDNUI7U0FDRjthQUFNO1lBQ0wsaUNBQWlDO1lBQ2pDLFlBQVksR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDO1NBQ3hDO0tBQ0Y7SUFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQztBQUNsQyxDQUFDO0FBeERELDRDQXdEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBCdWlsZGVyQ29udGV4dCB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9hcmNoaXRlY3QnO1xuaW1wb3J0IHsganNvbiB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgbW9kdWxlIGZyb20gJ21vZHVsZSc7XG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgQnJvd3NlckJ1aWxkZXJTY2hlbWEsIEkxOE5UcmFuc2xhdGlvbiB9IGZyb20gJy4uL2J1aWxkZXJzL2Jyb3dzZXIvc2NoZW1hJztcbmltcG9ydCB7IFNjaGVtYSBhcyBTZXJ2ZXJCdWlsZGVyU2NoZW1hIH0gZnJvbSAnLi4vYnVpbGRlcnMvc2VydmVyL3NjaGVtYSc7XG5pbXBvcnQgeyByZWFkVHNjb25maWcgfSBmcm9tICcuLi91dGlscy9yZWFkLXRzY29uZmlnJztcbmltcG9ydCB7IFRyYW5zbGF0aW9uTG9hZGVyLCBjcmVhdGVUcmFuc2xhdGlvbkxvYWRlciB9IGZyb20gJy4vbG9hZC10cmFuc2xhdGlvbnMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIG1vZHVsZSBsb2NhdGlvbiB1c2VkIHRvIHNlYXJjaCBmb3IgbG9jYWxlIHNwZWNpZmljIGRhdGEuXG4gKi9cbmNvbnN0IExPQ0FMRV9EQVRBX0JBU0VfTU9EVUxFID0gJ0Bhbmd1bGFyL2NvbW1vbi9sb2NhbGVzL2dsb2JhbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYWxlRGVzY3JpcHRpb24ge1xuICBmaWxlczoge1xuICAgIHBhdGg6IHN0cmluZztcbiAgICBpbnRlZ3JpdHk/OiBzdHJpbmc7XG4gICAgZm9ybWF0Pzogc3RyaW5nO1xuICB9W107XG4gIHRyYW5zbGF0aW9uPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGRhdGFQYXRoPzogc3RyaW5nO1xuICBiYXNlSHJlZj86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJMThuT3B0aW9ucyB7XG4gIGlubGluZUxvY2FsZXM6IFNldDxzdHJpbmc+O1xuICBzb3VyY2VMb2NhbGU6IHN0cmluZztcbiAgbG9jYWxlczogUmVjb3JkPHN0cmluZywgTG9jYWxlRGVzY3JpcHRpb24+O1xuICBmbGF0T3V0cHV0PzogYm9vbGVhbjtcbiAgcmVhZG9ubHkgc2hvdWxkSW5saW5lOiBib29sZWFuO1xuICBoYXNEZWZpbmVkU291cmNlTG9jYWxlPzogYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplVHJhbnNsYXRpb25GaWxlT3B0aW9uKFxuICBvcHRpb246IGpzb24uSnNvblZhbHVlLFxuICBsb2NhbGU6IHN0cmluZyxcbiAgZXhwZWN0T2JqZWN0SW5FcnJvcjogYm9vbGVhbixcbik6IHN0cmluZ1tdIHtcbiAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIFtvcHRpb25dO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9uKSAmJiBvcHRpb24uZXZlcnkoKGVsZW1lbnQpID0+IHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykpIHtcbiAgICByZXR1cm4gb3B0aW9uIGFzIHN0cmluZ1tdO1xuICB9XG5cbiAgbGV0IGVycm9yTWVzc2FnZSA9IGBQcm9qZWN0IGkxOG4gbG9jYWxlcyB0cmFuc2xhdGlvbiBmaWVsZCB2YWx1ZSBmb3IgJyR7bG9jYWxlfScgaXMgbWFsZm9ybWVkLiBgO1xuICBpZiAoZXhwZWN0T2JqZWN0SW5FcnJvcikge1xuICAgIGVycm9yTWVzc2FnZSArPSAnRXhwZWN0ZWQgYSBzdHJpbmcsIGFycmF5IG9mIHN0cmluZ3MsIG9yIG9iamVjdC4nO1xuICB9IGVsc2Uge1xuICAgIGVycm9yTWVzc2FnZSArPSAnRXhwZWN0ZWQgYSBzdHJpbmcgb3IgYXJyYXkgb2Ygc3RyaW5ncy4nO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJMThuT3B0aW9ucyhcbiAgbWV0YWRhdGE6IGpzb24uSnNvbk9iamVjdCxcbiAgaW5saW5lPzogYm9vbGVhbiB8IHN0cmluZ1tdLFxuKTogSTE4bk9wdGlvbnMge1xuICBpZiAobWV0YWRhdGEuaTE4biAhPT0gdW5kZWZpbmVkICYmICFqc29uLmlzSnNvbk9iamVjdChtZXRhZGF0YS5pMThuKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignUHJvamVjdCBpMThuIGZpZWxkIGlzIG1hbGZvcm1lZC4gRXhwZWN0ZWQgYW4gb2JqZWN0LicpO1xuICB9XG4gIG1ldGFkYXRhID0gbWV0YWRhdGEuaTE4biB8fCB7fTtcblxuICBjb25zdCBpMThuOiBJMThuT3B0aW9ucyA9IHtcbiAgICBpbmxpbmVMb2NhbGVzOiBuZXcgU2V0PHN0cmluZz4oKSxcbiAgICAvLyBlbi1VUyBpcyB0aGUgZGVmYXVsdCBsb2NhbGUgYWRkZWQgdG8gQW5ndWxhciBhcHBsaWNhdGlvbnMgKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9pMThuI2kxOG4tcGlwZXMpXG4gICAgc291cmNlTG9jYWxlOiAnZW4tVVMnLFxuICAgIGxvY2FsZXM6IHt9LFxuICAgIGdldCBzaG91bGRJbmxpbmUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbmxpbmVMb2NhbGVzLnNpemUgPiAwO1xuICAgIH0sXG4gIH07XG5cbiAgbGV0IHJhd1NvdXJjZUxvY2FsZTtcbiAgbGV0IHJhd1NvdXJjZUxvY2FsZUJhc2VIcmVmO1xuICBpZiAoanNvbi5pc0pzb25PYmplY3QobWV0YWRhdGEuc291cmNlTG9jYWxlKSkge1xuICAgIHJhd1NvdXJjZUxvY2FsZSA9IG1ldGFkYXRhLnNvdXJjZUxvY2FsZS5jb2RlO1xuICAgIGlmIChcbiAgICAgIG1ldGFkYXRhLnNvdXJjZUxvY2FsZS5iYXNlSHJlZiAhPT0gdW5kZWZpbmVkICYmXG4gICAgICB0eXBlb2YgbWV0YWRhdGEuc291cmNlTG9jYWxlLmJhc2VIcmVmICE9PSAnc3RyaW5nJ1xuICAgICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcm9qZWN0IGkxOG4gc291cmNlTG9jYWxlIGJhc2VIcmVmIGZpZWxkIGlzIG1hbGZvcm1lZC4gRXhwZWN0ZWQgYSBzdHJpbmcuJyk7XG4gICAgfVxuICAgIHJhd1NvdXJjZUxvY2FsZUJhc2VIcmVmID0gbWV0YWRhdGEuc291cmNlTG9jYWxlLmJhc2VIcmVmO1xuICB9IGVsc2Uge1xuICAgIHJhd1NvdXJjZUxvY2FsZSA9IG1ldGFkYXRhLnNvdXJjZUxvY2FsZTtcbiAgfVxuXG4gIGlmIChyYXdTb3VyY2VMb2NhbGUgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmICh0eXBlb2YgcmF3U291cmNlTG9jYWxlICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcm9qZWN0IGkxOG4gc291cmNlTG9jYWxlIGZpZWxkIGlzIG1hbGZvcm1lZC4gRXhwZWN0ZWQgYSBzdHJpbmcuJyk7XG4gICAgfVxuXG4gICAgaTE4bi5zb3VyY2VMb2NhbGUgPSByYXdTb3VyY2VMb2NhbGU7XG4gICAgaTE4bi5oYXNEZWZpbmVkU291cmNlTG9jYWxlID0gdHJ1ZTtcbiAgfVxuXG4gIGkxOG4ubG9jYWxlc1tpMThuLnNvdXJjZUxvY2FsZV0gPSB7XG4gICAgZmlsZXM6IFtdLFxuICAgIGJhc2VIcmVmOiByYXdTb3VyY2VMb2NhbGVCYXNlSHJlZixcbiAgfTtcblxuICBpZiAobWV0YWRhdGEubG9jYWxlcyAhPT0gdW5kZWZpbmVkICYmICFqc29uLmlzSnNvbk9iamVjdChtZXRhZGF0YS5sb2NhbGVzKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignUHJvamVjdCBpMThuIGxvY2FsZXMgZmllbGQgaXMgbWFsZm9ybWVkLiBFeHBlY3RlZCBhbiBvYmplY3QuJyk7XG4gIH0gZWxzZSBpZiAobWV0YWRhdGEubG9jYWxlcykge1xuICAgIGZvciAoY29uc3QgW2xvY2FsZSwgb3B0aW9uc10gb2YgT2JqZWN0LmVudHJpZXMobWV0YWRhdGEubG9jYWxlcykpIHtcbiAgICAgIGxldCB0cmFuc2xhdGlvbkZpbGVzO1xuICAgICAgbGV0IGJhc2VIcmVmO1xuICAgICAgaWYgKGpzb24uaXNKc29uT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgICAgIHRyYW5zbGF0aW9uRmlsZXMgPSBub3JtYWxpemVUcmFuc2xhdGlvbkZpbGVPcHRpb24ob3B0aW9ucy50cmFuc2xhdGlvbiwgbG9jYWxlLCBmYWxzZSk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmJhc2VIcmVmID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGJhc2VIcmVmID0gb3B0aW9ucy5iYXNlSHJlZjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHJhbnNsYXRpb25GaWxlcyA9IG5vcm1hbGl6ZVRyYW5zbGF0aW9uRmlsZU9wdGlvbihvcHRpb25zLCBsb2NhbGUsIHRydWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAobG9jYWxlID09PSBpMThuLnNvdXJjZUxvY2FsZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEFuIGkxOG4gbG9jYWxlICgnJHtsb2NhbGV9JykgY2Fubm90IGJvdGggYmUgYSBzb3VyY2UgbG9jYWxlIGFuZCBwcm92aWRlIGEgdHJhbnNsYXRpb24uYCxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgaTE4bi5sb2NhbGVzW2xvY2FsZV0gPSB7XG4gICAgICAgIGZpbGVzOiB0cmFuc2xhdGlvbkZpbGVzLm1hcCgoZmlsZSkgPT4gKHsgcGF0aDogZmlsZSB9KSksXG4gICAgICAgIGJhc2VIcmVmLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBpZiAoaW5saW5lID09PSB0cnVlKSB7XG4gICAgaTE4bi5pbmxpbmVMb2NhbGVzLmFkZChpMThuLnNvdXJjZUxvY2FsZSk7XG4gICAgT2JqZWN0LmtleXMoaTE4bi5sb2NhbGVzKS5mb3JFYWNoKChsb2NhbGUpID0+IGkxOG4uaW5saW5lTG9jYWxlcy5hZGQobG9jYWxlKSk7XG4gIH0gZWxzZSBpZiAoaW5saW5lKSB7XG4gICAgZm9yIChjb25zdCBsb2NhbGUgb2YgaW5saW5lKSB7XG4gICAgICBpZiAoIWkxOG4ubG9jYWxlc1tsb2NhbGVdICYmIGkxOG4uc291cmNlTG9jYWxlICE9PSBsb2NhbGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXF1ZXN0ZWQgbG9jYWxlICcke2xvY2FsZX0nIGlzIG5vdCBkZWZpbmVkIGZvciB0aGUgcHJvamVjdC5gKTtcbiAgICAgIH1cblxuICAgICAgaTE4bi5pbmxpbmVMb2NhbGVzLmFkZChsb2NhbGUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpMThuO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29uZmlndXJlSTE4bkJ1aWxkPFQgZXh0ZW5kcyBCcm93c2VyQnVpbGRlclNjaGVtYSB8IFNlcnZlckJ1aWxkZXJTY2hlbWE+KFxuICBjb250ZXh0OiBCdWlsZGVyQ29udGV4dCxcbiAgb3B0aW9uczogVCxcbik6IFByb21pc2U8e1xuICBidWlsZE9wdGlvbnM6IFQ7XG4gIGkxOG46IEkxOG5PcHRpb25zO1xufT4ge1xuICBpZiAoIWNvbnRleHQudGFyZ2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgYnVpbGRlciByZXF1aXJlcyBhIHRhcmdldC4nKTtcbiAgfVxuXG4gIGNvbnN0IGJ1aWxkT3B0aW9ucyA9IHsgLi4ub3B0aW9ucyB9O1xuICBjb25zdCB0c0NvbmZpZyA9IGF3YWl0IHJlYWRUc2NvbmZpZyhidWlsZE9wdGlvbnMudHNDb25maWcsIGNvbnRleHQud29ya3NwYWNlUm9vdCk7XG4gIGNvbnN0IG1ldGFkYXRhID0gYXdhaXQgY29udGV4dC5nZXRQcm9qZWN0TWV0YWRhdGEoY29udGV4dC50YXJnZXQpO1xuICBjb25zdCBpMThuID0gY3JlYXRlSTE4bk9wdGlvbnMobWV0YWRhdGEsIGJ1aWxkT3B0aW9ucy5sb2NhbGl6ZSk7XG5cbiAgLy8gTm8gYWRkaXRpb25hbCBwcm9jZXNzaW5nIG5lZWRlZCBpZiBubyBpbmxpbmluZyByZXF1ZXN0ZWQgYW5kIG5vIHNvdXJjZSBsb2NhbGUgZGVmaW5lZC5cbiAgaWYgKCFpMThuLnNob3VsZElubGluZSAmJiAhaTE4bi5oYXNEZWZpbmVkU291cmNlTG9jYWxlKSB7XG4gICAgcmV0dXJuIHsgYnVpbGRPcHRpb25zLCBpMThuIH07XG4gIH1cblxuICBjb25zdCBwcm9qZWN0Um9vdCA9IHBhdGguam9pbihjb250ZXh0LndvcmtzcGFjZVJvb3QsIChtZXRhZGF0YS5yb290IGFzIHN0cmluZykgfHwgJycpO1xuICAvLyBUaGUgdHJhaWxpbmcgc2xhc2ggaXMgcmVxdWlyZWQgdG8gc2lnbmFsIHRoYXQgdGhlIHBhdGggaXMgYSBkaXJlY3RvcnkgYW5kIG5vdCBhIGZpbGUuXG4gIGNvbnN0IHByb2plY3RSZXF1aXJlID0gbW9kdWxlLmNyZWF0ZVJlcXVpcmUocHJvamVjdFJvb3QgKyAnLycpO1xuICBjb25zdCBsb2NhbGVSZXNvbHZlciA9IChsb2NhbGU6IHN0cmluZykgPT5cbiAgICBwcm9qZWN0UmVxdWlyZS5yZXNvbHZlKHBhdGguam9pbihMT0NBTEVfREFUQV9CQVNFX01PRFVMRSwgbG9jYWxlKSk7XG5cbiAgLy8gTG9hZCBsb2NhbGUgZGF0YSBhbmQgdHJhbnNsYXRpb25zIChpZiBwcmVzZW50KVxuICBsZXQgbG9hZGVyO1xuICBjb25zdCB1c2VkRm9ybWF0cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBmb3IgKGNvbnN0IFtsb2NhbGUsIGRlc2NdIG9mIE9iamVjdC5lbnRyaWVzKGkxOG4ubG9jYWxlcykpIHtcbiAgICBpZiAoIWkxOG4uaW5saW5lTG9jYWxlcy5oYXMobG9jYWxlKSAmJiBsb2NhbGUgIT09IGkxOG4uc291cmNlTG9jYWxlKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBsZXQgbG9jYWxlRGF0YVBhdGggPSBmaW5kTG9jYWxlRGF0YVBhdGgobG9jYWxlLCBsb2NhbGVSZXNvbHZlcik7XG4gICAgaWYgKCFsb2NhbGVEYXRhUGF0aCkge1xuICAgICAgY29uc3QgW2ZpcnN0XSA9IGxvY2FsZS5zcGxpdCgnLScpO1xuICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgIGxvY2FsZURhdGFQYXRoID0gZmluZExvY2FsZURhdGFQYXRoKGZpcnN0LnRvTG93ZXJDYXNlKCksIGxvY2FsZVJlc29sdmVyKTtcbiAgICAgICAgaWYgKGxvY2FsZURhdGFQYXRoKSB7XG4gICAgICAgICAgY29udGV4dC5sb2dnZXIud2FybihcbiAgICAgICAgICAgIGBMb2NhbGUgZGF0YSBmb3IgJyR7bG9jYWxlfScgY2Fubm90IGJlIGZvdW5kLiAgVXNpbmcgbG9jYWxlIGRhdGEgZm9yICcke2ZpcnN0fScuYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghbG9jYWxlRGF0YVBhdGgpIHtcbiAgICAgIGNvbnRleHQubG9nZ2VyLndhcm4oXG4gICAgICAgIGBMb2NhbGUgZGF0YSBmb3IgJyR7bG9jYWxlfScgY2Fubm90IGJlIGZvdW5kLiAgTm8gbG9jYWxlIGRhdGEgd2lsbCBiZSBpbmNsdWRlZCBmb3IgdGhpcyBsb2NhbGUuYCxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlc2MuZGF0YVBhdGggPSBsb2NhbGVEYXRhUGF0aDtcbiAgICB9XG5cbiAgICBpZiAoIWRlc2MuZmlsZXMubGVuZ3RoKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBsb2FkZXIgPz89IGF3YWl0IGNyZWF0ZVRyYW5zbGF0aW9uTG9hZGVyKCk7XG5cbiAgICBsb2FkVHJhbnNsYXRpb25zKFxuICAgICAgbG9jYWxlLFxuICAgICAgZGVzYyxcbiAgICAgIGNvbnRleHQud29ya3NwYWNlUm9vdCxcbiAgICAgIGxvYWRlcixcbiAgICAgIHtcbiAgICAgICAgd2FybihtZXNzYWdlKSB7XG4gICAgICAgICAgY29udGV4dC5sb2dnZXIud2FybihtZXNzYWdlKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3IobWVzc2FnZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB1c2VkRm9ybWF0cyxcbiAgICAgIGJ1aWxkT3B0aW9ucy5pMThuRHVwbGljYXRlVHJhbnNsYXRpb24sXG4gICAgKTtcblxuICAgIGlmICh1c2VkRm9ybWF0cy5zaXplID4gMSAmJiB0c0NvbmZpZy5vcHRpb25zLmVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQgIT09IGZhbHNlKSB7XG4gICAgICAvLyBUaGlzIGxpbWl0YXRpb24gaXMgb25seSBmb3IgbGVnYWN5IG1lc3NhZ2UgaWQgc3VwcG9ydCAoZGVmYXVsdHMgdG8gdHJ1ZSBhcyBvZiA5LjApXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdMb2NhbGl6YXRpb24gY3VycmVudGx5IG9ubHkgc3VwcG9ydHMgdXNpbmcgb25lIHR5cGUgb2YgdHJhbnNsYXRpb24gZmlsZSBmb3JtYXQgZm9yIHRoZSBlbnRpcmUgYXBwbGljYXRpb24uJyxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgaW5saW5pbmcgc3RvcmUgdGhlIG91dHB1dCBpbiBhIHRlbXBvcmFyeSBsb2NhdGlvbiB0byBmYWNpbGl0YXRlIHBvc3QtcHJvY2Vzc2luZ1xuICBpZiAoaTE4bi5zaG91bGRJbmxpbmUpIHtcbiAgICBjb25zdCB0ZW1wUGF0aCA9IGZzLm1rZHRlbXBTeW5jKHBhdGguam9pbihmcy5yZWFscGF0aFN5bmMob3MudG1wZGlyKCkpLCAnYW5ndWxhci1jbGktaTE4bi0nKSk7XG4gICAgYnVpbGRPcHRpb25zLm91dHB1dFBhdGggPSB0ZW1wUGF0aDtcblxuICAgIHByb2Nlc3Mub24oJ2V4aXQnLCAoKSA9PiBkZWxldGVUZW1wRGlyZWN0b3J5KHRlbXBQYXRoKSk7XG4gICAgcHJvY2Vzcy5vbmNlKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICBkZWxldGVUZW1wRGlyZWN0b3J5KHRlbXBQYXRoKTtcblxuICAgICAgLy8gTmVlZGVkIGR1ZSB0byBgb3JhYCBhcyBvdGhlcndpc2UgcHJvY2VzcyB3aWxsIG5vdCB0ZXJtaW5hdGUuXG4gICAgICBwcm9jZXNzLmtpbGwocHJvY2Vzcy5waWQsICdTSUdJTlQnKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7IGJ1aWxkT3B0aW9ucywgaTE4biB9O1xufVxuXG5mdW5jdGlvbiBmaW5kTG9jYWxlRGF0YVBhdGgobG9jYWxlOiBzdHJpbmcsIHJlc29sdmVyOiAobG9jYWxlOiBzdHJpbmcpID0+IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAvLyBSZW1vdmUgcHJpdmF0ZSB1c2Ugc3VidGFnc1xuICBjb25zdCBzY3J1YmJlZExvY2FsZSA9IGxvY2FsZS5yZXBsYWNlKC8teCgtW2EtekEtWjAtOV17MSw4fSkrJC8sICcnKTtcblxuICB0cnkge1xuICAgIHJldHVybiByZXNvbHZlcihzY3J1YmJlZExvY2FsZSk7XG4gIH0gY2F0Y2gge1xuICAgIGlmIChzY3J1YmJlZExvY2FsZSA9PT0gJ2VuLVVTJykge1xuICAgICAgLy8gZmFsbGJhY2sgdG8ga25vd24gZXhpc3RpbmcgZW4tVVMgbG9jYWxlIGRhdGEgYXMgb2YgOS4wXG4gICAgICByZXR1cm4gZmluZExvY2FsZURhdGFQYXRoKCdlbi1VUy1QT1NJWCcsIHJlc29sdmVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKiogUmVtb3ZlIHRlbXBvcmFyeSBkaXJlY3RvcnkgdXNlZCBmb3IgaTE4biBwcm9jZXNzaW5nLiAqL1xuZnVuY3Rpb24gZGVsZXRlVGVtcERpcmVjdG9yeSh0ZW1wUGF0aDogc3RyaW5nKTogdm9pZCB7XG4gIC8vIFRoZSBiZWxvdyBzaG91bGQgYmUgcmVtb3ZlZCBhbmQgcmVwbGFjZWQgd2l0aCBqdXN0IGBybVN5bmNgIHdoZW4gc3VwcG9ydCBmb3IgTm9kZS5KcyAxMiBpcyByZW1vdmVkLlxuICBjb25zdCB7IHJtU3luYywgcm1kaXJTeW5jIH0gPSBmcyBhcyB0eXBlb2YgZnMgJiB7XG4gICAgcm1TeW5jPzogKFxuICAgICAgcGF0aDogZnMuUGF0aExpa2UsXG4gICAgICBvcHRpb25zPzoge1xuICAgICAgICBmb3JjZT86IGJvb2xlYW47XG4gICAgICAgIG1heFJldHJpZXM/OiBudW1iZXI7XG4gICAgICAgIHJlY3Vyc2l2ZT86IGJvb2xlYW47XG4gICAgICAgIHJldHJ5RGVsYXk/OiBudW1iZXI7XG4gICAgICB9LFxuICAgICkgPT4gdm9pZDtcbiAgfTtcblxuICB0cnkge1xuICAgIGlmIChybVN5bmMpIHtcbiAgICAgIHJtU3luYyh0ZW1wUGF0aCwgeyBmb3JjZTogdHJ1ZSwgcmVjdXJzaXZlOiB0cnVlLCBtYXhSZXRyaWVzOiAzIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBybWRpclN5bmModGVtcFBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlLCBtYXhSZXRyaWVzOiAzIH0pO1xuICAgIH1cbiAgfSBjYXRjaCB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZFRyYW5zbGF0aW9ucyhcbiAgbG9jYWxlOiBzdHJpbmcsXG4gIGRlc2M6IExvY2FsZURlc2NyaXB0aW9uLFxuICB3b3Jrc3BhY2VSb290OiBzdHJpbmcsXG4gIGxvYWRlcjogVHJhbnNsYXRpb25Mb2FkZXIsXG4gIGxvZ2dlcjogeyB3YXJuOiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkOyBlcnJvcjogKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCB9LFxuICB1c2VkRm9ybWF0cz86IFNldDxzdHJpbmc+LFxuICBkdXBsaWNhdGVUcmFuc2xhdGlvbj86IEkxOE5UcmFuc2xhdGlvbixcbikge1xuICBsZXQgdHJhbnNsYXRpb25zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgZm9yIChjb25zdCBmaWxlIG9mIGRlc2MuZmlsZXMpIHtcbiAgICBjb25zdCBsb2FkUmVzdWx0ID0gbG9hZGVyKHBhdGguam9pbih3b3Jrc3BhY2VSb290LCBmaWxlLnBhdGgpKTtcblxuICAgIGZvciAoY29uc3QgZGlhZ25vc3RpY3Mgb2YgbG9hZFJlc3VsdC5kaWFnbm9zdGljcy5tZXNzYWdlcykge1xuICAgICAgaWYgKGRpYWdub3N0aWNzLnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKGBFcnJvciBwYXJzaW5nIHRyYW5zbGF0aW9uIGZpbGUgJyR7ZmlsZS5wYXRofSc6ICR7ZGlhZ25vc3RpY3MubWVzc2FnZX1gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci53YXJuKGBXQVJOSU5HIFske2ZpbGUucGF0aH1dOiAke2RpYWdub3N0aWNzLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGxvYWRSZXN1bHQubG9jYWxlICE9PSB1bmRlZmluZWQgJiYgbG9hZFJlc3VsdC5sb2NhbGUgIT09IGxvY2FsZSkge1xuICAgICAgbG9nZ2VyLndhcm4oXG4gICAgICAgIGBXQVJOSU5HIFske2ZpbGUucGF0aH1dOiBGaWxlIHRhcmdldCBsb2NhbGUgKCcke2xvYWRSZXN1bHQubG9jYWxlfScpIGRvZXMgbm90IG1hdGNoIGNvbmZpZ3VyZWQgbG9jYWxlICgnJHtsb2NhbGV9JylgLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICB1c2VkRm9ybWF0cz8uYWRkKGxvYWRSZXN1bHQuZm9ybWF0KTtcbiAgICBmaWxlLmZvcm1hdCA9IGxvYWRSZXN1bHQuZm9ybWF0O1xuICAgIGZpbGUuaW50ZWdyaXR5ID0gbG9hZFJlc3VsdC5pbnRlZ3JpdHk7XG5cbiAgICBpZiAodHJhbnNsYXRpb25zKSB7XG4gICAgICAvLyBNZXJnZSB0cmFuc2xhdGlvbnNcbiAgICAgIGZvciAoY29uc3QgW2lkLCBtZXNzYWdlXSBvZiBPYmplY3QuZW50cmllcyhsb2FkUmVzdWx0LnRyYW5zbGF0aW9ucykpIHtcbiAgICAgICAgaWYgKHRyYW5zbGF0aW9uc1tpZF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNvbnN0IGR1cGxpY2F0ZVRyYW5zbGF0aW9uTWVzc2FnZSA9IGBbJHtmaWxlLnBhdGh9XTogRHVwbGljYXRlIHRyYW5zbGF0aW9ucyBmb3IgbWVzc2FnZSAnJHtpZH0nIHdoZW4gbWVyZ2luZy5gO1xuICAgICAgICAgIHN3aXRjaCAoZHVwbGljYXRlVHJhbnNsYXRpb24pIHtcbiAgICAgICAgICAgIGNhc2UgSTE4TlRyYW5zbGF0aW9uLklnbm9yZTpcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEkxOE5UcmFuc2xhdGlvbi5FcnJvcjpcbiAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBFUlJPUiAke2R1cGxpY2F0ZVRyYW5zbGF0aW9uTWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEkxOE5UcmFuc2xhdGlvbi5XYXJuaW5nOlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oYFdBUk5JTkcgJHtkdXBsaWNhdGVUcmFuc2xhdGlvbk1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0cmFuc2xhdGlvbnNbaWRdID0gbWVzc2FnZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRmlyc3Qgb3Igb25seSB0cmFuc2xhdGlvbiBmaWxlXG4gICAgICB0cmFuc2xhdGlvbnMgPSBsb2FkUmVzdWx0LnRyYW5zbGF0aW9ucztcbiAgICB9XG4gIH1cbiAgZGVzYy50cmFuc2xhdGlvbiA9IHRyYW5zbGF0aW9ucztcbn1cbiJdfQ==