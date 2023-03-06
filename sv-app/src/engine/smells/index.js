const acorn = require('acorn')
const walk = require('acorn-walk')
const jsx = require('acorn-jsx')

const empty = {
    largeFuncs: [],
    largeNesting: [],
    godObjects: {
        manyVariables: [],
        manyParameters: [],
    },
    unusedVars: [],
    magicLiterals: [],
    callbackHell: [],
}

const hasJSX = ast => {
    try {
        let hasJSX = false
        walk.recursive(ast, null, {
            JSXElement(node) {
                hasJSX = true
            },
            JSXFragment(node) {
                hasJSX = true
            },
        })

        return hasJSX
    } catch (e) {
        console.log('Issue in smells/hasJSX ' + e)
        return true
    }
}

const smells = content => {
    let output = empty
    let ast
    try {
        ast = acorn.Parser.extend(jsx()).parse(content, {
            ecmaVersion: 2022,
            sourceType: 'module',
            locations: true,
            plugins: { jsx: true },
        })
    } catch (e) {
        console.log(`Error: ${e}`)
        return output
    }

    const tryAdd = (callback, term) => {
        try {
            const toAdd = callback()
            output[term] = toAdd
        } catch (e) {
            console.log(`Error: ${e}`)
            output[term] = []
        }
    }

    tryAdd(() => detectLargeFuncs(ast), 'largeFuncs')
    tryAdd(() => detectNesting(ast), 'largeNesting')
    tryAdd(() => detectManyVars(ast), 'godVariables')
    tryAdd(() => detectManyPars(ast), 'godParameters')
    tryAdd(() => detectUnusedVars(ast), 'unusedVars')
    tryAdd(() => detectMagicLiterals(ast), 'magicLiterals')
    tryAdd(() => detectCallbackHell(ast), 'callbackHell')
    return output
}

const findUnusedVarsNormal = ast => {
    const declaredVars = new Map()
    const usedVars = new Set()
    const unusedVars = []

    walk.recursive(ast, null, {
        JSXElement(node) {
            return
        },
        JSXFragment(node) {
            return
        },
        VariableDeclarator(node, ancestors) {
            const name = node.id.name
            const startLine = node.loc.start.line
            const endLine = node.loc.end.line
            declaredVars.set(name, { startLine, endLine, ancestors })
        },
        'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(node) {
            for (const param of node.params) {
                usedVars.add(param.name)
            }

            walk.ancestor(node, {
                VariableDeclarator(node) {
                    usedVars.add(node.id.name)
                },
                Identifier(node) {
                    usedVars.add(node.name)
                },
            })
        },
        VariableDeclaration(node) {
            for (const declaration of node.declarations) {
                const name = declaration.id.name
                const startLine = declaration.loc.start.line
                const endLine = declaration.loc.end.line
                declaredVars.set(name, { startLine, endLine })
            }
        },
    })

    for (const [name, { startLine }] of declaredVars) {
        if (!usedVars.has(name)) {
            unusedVars.push({ name, line: startLine })
        }
    }

    return unusedVars
}

const findUnusedVarsFuncs = ast => {
    const declaredVars = new Map()
    const usedVars = new Set()
    const unusedVars = []

    walk.recursive(ast, null, {
        JSXElement(node) {
            return
        },
        JSXFragment(node) {
            return
        },
        VariableDeclarator(node) {
            const name = node.id.name
            const startLine = node.loc.start.line
            const endLine = node.loc.end.line
            declaredVars.set(name, { startLine, endLine })
        },
        FunctionDeclaration(node) {
            const paramNames = node.params.map(param => param.name)
            walk.ancestor(node, {
                VariableDeclarator(node) {
                    usedVars.add(node.id.name)
                },
                Identifier(node) {
                    usedVars.add(node.name)
                },
            })

            for (const paramName of paramNames) {
                if (!usedVars.has(paramName)) {
                    unusedVars.push({
                        name: paramName,
                        line: node.loc.start.line,
                    })
                }
            }
        },
        FunctionExpression(node) {
            const paramNames = node.params.map(param => param.name)
            walk.ancestor(node, {
                VariableDeclarator(node) {
                    usedVars.add(node.id.name)
                },
                Identifier(node) {
                    usedVars.add(node.name)
                },
            })

            for (const paramName of paramNames) {
                if (!usedVars.has(paramName)) {
                    unusedVars.push({
                        name: paramName,
                        line: node.loc.start.line,
                    })
                }
            }
        },
        ArrowFunctionExpression(node) {
            const paramNames = node.params.map(param => param.name)
            walk.ancestor(node, {
                VariableDeclarator(node) {
                    usedVars.add(node.id.name)
                },
                Identifier(node) {
                    usedVars.add(node.name)
                },
            })

            for (const paramName of paramNames) {
                if (!usedVars.has(paramName)) {
                    unusedVars.push({
                        name: paramName,
                        line: node.loc.start.line,
                    })
                }
            }
        },
    })

    for (const [name, { startLine }] of declaredVars) {
        if (!usedVars.has(name)) {
            unusedVars.push({ name, line: startLine })
        }
    }

    return unusedVars
}

function detectUnusedVars(ast) {
    try {
        let result = []

        walk.recursive(ast, null, {
            JSXElement(node) {
                return
            },
            JSXFragment(node) {
                return
            },
            FunctionDeclaration(node) {
                if (hasJSX(node)) return
                result = result.concat(findUnusedVarsFuncs(node))
                result = result.concat(findUnusedVarsNormal(node))
            },
            FunctionExpression(node) {
                if (hasJSX(node)) return
                result = result.concat(findUnusedVarsFuncs(node))
                result = result.concat(findUnusedVarsNormal(node))
            },
            ArrowFunctionExpression(node) {
                if (hasJSX(node)) return
                result = result.concat(findUnusedVarsFuncs(node))
                result = result.concat(findUnusedVarsNormal(node))
            },
            ClassDeclaration(node) {
                if (hasJSX(node)) return
                result = result.concat(findUnusedVarsFuncs(node))
                result = result.concat(findUnusedVarsNormal(node))
            },
            ClassExpression(node) {
                if (hasJSX(node)) return
                result = result.concat(findUnusedVarsFuncs(node))
                result = result.concat(findUnusedVarsNormal(node))
            },
        })

        return result
    } catch (exception) {
        console.log(`Exception at detectUnusedVars ${exception}`)
        return []
    }
}

function detectManyPars(ast, maxParams = 10) {
    try {
        const result = []

        walk.recursive(ast, null, {
            JSXElement(node) {
                return
            },
            JSXFragment(node) {
                return
            },
            FunctionDeclaration(node) {
                if (hasJSX(node)) return
            },
            FunctionExpression(node) {
                if (hasJSX(node)) return
            },
            ArrowFunctionExpression(node) {
                if (hasJSX(node)) return
            },
            ClassDeclaration(node) {
                if (hasJSX(node)) return
                try {
                    const count = node.body.body.find(n => n.kind === 'constructor').value.params.length
                    if (count > maxParams) {
                        result.push({
                            name: node.id ? node.id.name : 'anonymous',
                            start: node.loc.start.line,
                            end: node.loc.end.line,
                        })
                    }
                } catch (e) {
                    return
                }
            },
            ClassExpression(node) {
                if (hasJSX(node)) return
                try {
                    const count = node.body.body.find(n => n.kind === 'constructor').value.params.length
                    if (count > maxParams) {
                        result.push({
                            name: node.id ? node.id.name : 'anonymous',
                            start: node.loc.start.line,
                            end: node.loc.end.line,
                        })
                    }
                } catch (e) {
                    return
                }
            },
        })

        return result
    } catch (exception) {
        console.log(`Exception at detectManyPars ${exception}`)
        return []
    }
}

const detectManyVars = (ast, maxVars = 10) => {
    try {
        const result = []

        const countVars = node => {
            let count = 0

            walk.recursive(node, null, {
                VariableDeclaration(variableNode) {
                    count += variableNode.declarations.length
                },
            })

            return count
        }

        walk.recursive(ast, null, {
            JSXElement(node) {
                return
            },
            JSXFragment(node) {
                return
            },
            ClassDeclaration(node) {
                if (hasJSX(node)) return
            },
            ClassExpression(node) {
                if (hasJSX(node)) return
            },
            FunctionDeclaration(node) {
                if (hasJSX(node)) return
                const count = countVars(node)
                if (count > maxVars) {
                    result.push({
                        name: node.id.name,
                        start: node.loc.start.line,
                        end: node.loc.end.line,
                    })
                }
            },
            FunctionExpression(node) {
                if (hasJSX(node)) return
                const count = countVars(node)
                if (count > maxVars) {
                    result.push({
                        name: node.id ? node.id.name : 'anonymous',
                        start: node.loc.start.line,
                        end: node.loc.end.line,
                    })
                }
            },
            ArrowFunctionExpression(node) {
                if (hasJSX(node)) return
                const count = countVars(node)
                if (count > maxVars) {
                    result.push({
                        name: 'anonymous',
                        start: node.loc.start.line,
                        end: node.loc.end.line,
                    })
                }
            },
        })

        return result
    } catch (exception) {
        console.log(`Exception at detectManyVars ${exception}`)
        return []
    }
}

const detectNesting = (ast, depthLimit = 4) => {
    try {
        let maxDepth = 0
        const result = []

        const getDepth = (node, depth) => {
            if (depth > maxDepth) {
                maxDepth = depth
            }

            if (node.type === 'BlockStatement') {
                depth++
                if (depth == depthLimit) {
                    result.push({
                        start: node.loc.start.line,
                        end: node.loc.end.line,
                    })
                    return
                }
            }

            for (const key in node) {
                const childNode = node[key]
                if (Array.isArray(childNode)) {
                    for (const child of childNode) {
                        getDepth(child, depth)
                    }
                } else if (typeof childNode === 'object' && childNode !== null) {
                    getDepth(childNode, depth)
                }
            }
        }

        getDepth(ast, 0)

        return result
    } catch (exception) {
        console.log(`Exception at detectNesting ${exception}`)
        return []
    }
}

// need to find function names if available
// if jsx, dont check - because its large anyway
const detectLargeFuncs = (ast, maxArgs = 5) => {
    try {
        const result = []

        walk.recursive(ast, null, {
            JSXElement(node) {
                return
            },
            JSXFragment(node) {
                return
            },
            ClassDeclaration(node) {
                if (hasJSX(node)) return
            },
            ClassExpression(node) {
                if (hasJSX(node)) return
            },
            FunctionDeclaration(node, ancestors) {
                if (hasJSX(node)) return
                if (node.params.length > maxArgs) {
                    result.push({
                        name: node.id.name,
                        start: node.loc.start.line,
                        end: node.loc.end.line,
                    })
                }
            },
            FunctionExpression(node, ancestors) {
                if (hasJSX(node)) return
                if (node.params.length > maxArgs) {
                    result.push({
                        name: node.id ? node.id.name : 'anonymous',
                        start: node.loc.start.line,
                        end: node.loc.end.line,
                    })
                }
            },
            ArrowFunctionExpression(node, ancestors) {
                if (hasJSX(node)) return
                if (node.params.length > maxArgs) {
                    result.push({
                        name: 'anonymous',
                        start: node.loc.start.line,
                        end: node.loc.end.line,
                    })
                }
            },
        })

        return result
    } catch (exception) {
        console.log(`Exception at detectLargeFuncs ${exception}`)
        return []
    }
}

function detectMagicLiterals(ast) {
    const excludeTypes = ['ObjectExpression']

    const literalLines = []

    function traverse(node) {
        if (node.type === 'Literal' && typeof node.value === 'number') {
            literalLines.push(node.loc.start.line)
        } else if (!excludeTypes.includes(node.type)) {
            for (const key in node) {
                const child = node[key]
                if (typeof child === 'object' && child !== null && key !== 'parent') {
                    if (Array.isArray(child)) {
                        child.forEach(c => traverse(c))
                    } else {
                        traverse(child)
                    }
                }
            }
        }
    }

    traverse(ast)

    return literalLines
}

const detectCallbackHell = (ast, maxDepth) => {
    const offenders = []
    let stack = []

    walk.simple(ast, {
        CallExpression(node) {
            if (
                node.callee.type === 'Identifier' &&
                node.arguments.length === 2 &&
                node.arguments[1].type === 'FunctionExpression'
            ) {
                stack.push(node)
            }
        },
    })

    function popStack() {
        const element = stack.pop()
        if (stack.length === 0) {
            offenders.push({ start: element.loc.start.line, end: element.loc.end.line })
        }
    }

    walk.ancestor(ast, {
        CallExpression(node, ancestors) {
            if (stack.length === 0) return

            const parent = ancestors[ancestors.length - 2]
            const grandParent = ancestors[ancestors.length - 3]

            if (parent !== stack[stack.length - 1] && grandParent !== stack[stack.length - 1]) {
                popStack()
                return
            }

            const callbackIndex = parent.arguments.indexOf(node)

            if (callbackIndex !== 1) return

            const stackIndex = stack.findIndex(call => call === parent)

            if (stackIndex === -1) return

            const depth = stack.length - stackIndex

            if (depth > maxDepth) {
                const startLine = stack[stackIndex].loc.start.line
                const endLine = node.loc.end.line
                offenders.push({ startLine, endLine })
            }
        },
    })

    return offenders
}

module.exports = smells
