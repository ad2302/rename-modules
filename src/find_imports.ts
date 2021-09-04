import fs from "fs";
import path from "path";
import ensureArray from "ensure-array";
import _get from "lodash.get";
import _difference from "lodash.difference";
import _values from "lodash.values";
import _uniq from "lodash.uniq";
import _flatten from "lodash.flatten";
import parser from "@typescript-eslint/typescript-estree";
import glob from "fast-glob";
// import resolveGlob from "./resolve-glob";

const defaultOptions = {
    packageImports: true,
    absoluteImports: false,
    relativeImports: false
};

// @params {string|array} patterns The glob pattern or a list of glob patterns.
// @params {object} options The options object.
// @params {boolean} [options.flatten] True to flatten the output, defaults to false.
// @params {boolean} [options.packageImports] True to return package imports, defaults to true.
// @params {boolean} [options.absoluteImports] True to return absolute imports, defaults to false.
// @params {boolean} [options.relativeImports] True to return relative imports, defaults to false.
export function findImports (patterns:string|string[], options: typeof defaultOptions, _cwd:string) {
    var cwd = _cwd ? _cwd : process.cwd();
    var requiredModules = {};
    var filepaths = [];
    var addModule = function(modulePath:string, value:string) {
        if (value[0] === '/') {
            if (!!options.absoluteImports) {
                requiredModules[modulePath].push(value);
            }
        } else if (value[0] === '.') {
            if (!!options.relativeImports) {
                requiredModules[modulePath].push(value);
            }
        } else if (!!options.packageImports) {
            requiredModules[modulePath].push(value);
        }
    };
    var isRequireExpression = function(o) {
        return (
            _get(o, 'type') === 'CallExpression' &&
            _get(o, 'callee.type') === 'Identifier' &&
            _get(o, 'callee.name') === 'require' &&
            _get(o, 'arguments[0].type') === 'Literal'
        );
    };

    // options
    options = Object.assign({}, defaultOptions, options || {});
    var ignore = options.ignore || []
    var absolute = options.absolute || false
    { // glob patterns
        var positives = [];
        var negatives = [];

        patterns = [].concat(patterns || []);
        patterns.forEach(function(pattern) {
            // Make a glob pattern absolute
            pattern = resolveGlob(pattern, {base: cwd});

            if (pattern.charAt(0) === '!') {
                negatives = negatives.concat(glob.sync(pattern.slice(1), {base: cwd,ignore:ignore,absolute:absolute}));
            } else {
                positives = positives.concat(glob.sync(pattern, {base: cwd,ignore:ignore,absolute:absolute}));
            }
        });

        filepaths = _difference(positives, negatives);
    }

    filepaths.forEach(function(filepath) {
        var stat = fs.statSync(filepath);
        if (!stat.isFile()) {
            return;
        }

        try {
            // var result = babel.transformFileSync(filepath, babelOptions);
            var tree = parser.parse(fs.readFileSync(filepath).toString());
            var modulePath = path.relative(cwd, filepath);

            requiredModules[modulePath] = [];

            tree.body.forEach(function(node) {
                if (node.type === 'ExpressionStatement' &&
                    node.expression.type === 'CallExpression' &&
                    node.expression.callee.type === 'MemberExpression' &&
                    node.expression.callee.object.type === 'CallExpression' &&
                    node.expression.callee.object.callee.name === 'require') {
                    addModule(modulePath, node.expression.callee.object.arguments[0].value);
                    return;
                }

                if (node.type === 'ExpressionStatement' &&
                    node.expression.type === 'CallExpression' &&
                    node.expression.callee.name === 'require') {
                    addModule(modulePath, node.expression.arguments[0].value);
                    return;
                }

                if (node.type === 'VariableDeclaration') {
                    node.declarations.forEach(function(decl) {
                        var expr = decl.init;
                        if (isRequireExpression(expr)) {
                            addModule(modulePath, _get(expr, 'arguments[0].value'));
                            return;
                        }

                        var exprArguments = ensureArray(_get(decl, 'init.arguments'));
                        exprArguments.forEach(function(exprArgument) {
                            if (isRequireExpression(exprArgument)) {
                                addModule(modulePath, _get(exprArgument, 'arguments[0].value'));
                            }
                        });
                    });
                    return;
                }

                if (node.type === 'ImportDeclaration') {
                    addModule(modulePath, node.source.value);
                    return;
                }
            });
        } catch (e) {
            console.error('Error in `' + modulePath + '`: ' + e);
        }
    });

    if (options.flatten) {
        requiredModules = _uniq(_flatten(_values(requiredModules)));
    }

    return requiredModules;
};