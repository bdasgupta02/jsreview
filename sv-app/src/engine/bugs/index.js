const acorn = require('acorn')
const walk = require('acorn-walk')
const jsx = require('acorn-jsx')
const escodegen = require('escodegen')
const axios = require('axios')

const bugs = async content => {
    try {
        const result = []
        const funcs = extrFunctions(content)
        for (let i = 0; i < funcs.length; i++) {
            try {
                const tokenized = tokenize(convToExpression(funcs[i].node))
                const tokenized_no_braces = removeCurvyWrapper(tokenized)
                const pred = await predRefine(tokenized_no_braces)
                if (pred === 'error') {
                    continue
                }
                const isDefect = matchDiff(tokenized_no_braces, pred)
                if (isDefect) {
                    result.push({ start: funcs[i].start, end: funcs[i].end, patch: pred })
                }
            } catch (eInner) {
                console.log(`Error: ${eInner}`)
            }
        }
        return result
    } catch (e) {
        console.log(`Error in bugs: ${e}`)
        return []
    }
}

const removeCurvyWrapper = code => {
    const remIdx = idx => {
        code = code.slice(0, idx) + code.slice(idx + 1)
    }

    let funcExp = false
    let firstBrace = false
    for (let i = 0; i < code.length; i++) {
        if (code[i] === 'f' && code.substring(i, i + 8).includes('function') && !firstBrace) {
            funcExp = true
        } else if (code[i] === '(' && funcExp) {
            firstBrace = true
            funcExp = false
        } else if (code[i] === '(' && firstBrace) {
            remIdx(i)
            break
        }
    }

    for (let i = code.length - 1; i >= 0; i--) {
        if (code[i] === ')') {
            remIdx(i)
            break
        }
    }

    return code
}

function convToExpression(ast) {
    walk.simple(ast, {
        FunctionDeclaration(node) {
            node.type = 'FunctionExpression'
            node.expression = false
        },
        ArrowFunctionExpression(node) {
            node.type = 'FunctionExpression'
            node.expression = true
        },
    })
    return ast
}

const matchDiff = (funcStr, predStr) => {
    const removeSpaces = str => str.replace(/\s+/g, '')
    const funcClean = removeSpaces(funcStr)
    const predClean = removeSpaces(predStr)
    return funcClean !== predClean
}

const predRefine = async tokenized => {
    const resp = await axios.post(`${process.env.SV_MODELS}/predict/multiple/bugs`, [tokenized], {
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    })

    const data = resp.data
    if (data && Array.isArray(data) && data.length > 0) {
        return data[0]
    } else {
        return 'error'
    }
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
        console.log('Error in hasJSX: ' + e)
        return true
    }
}

const extrFunctions = code => {
    const funcs = []
    const ast = acorn.Parser.extend(jsx()).parse(code, {
        ecmaVersion: 2022,
        sourceType: 'module',
        locations: true,
        plugins: { jsx: true },
    })

    const traverse = jst => {
        walk.recursive(jst, null, {
            JSXElement(node) {
                return
            },
            JSXFragment(node) {
                return
            },
            FunctionDeclaration(node) {
                if (!hasJSX(node)) funcs.push({ node, start: node.loc.start.line, end: node.loc.start.line })
                if ('body' in node && node.body && node.body != null) {
                    traverse(node.body)
                }
            },
            FunctionExpression(node) {
                if (!hasJSX(node)) funcs.push({ node, start: node.loc.start.line, end: node.loc.start.line })
                if ('body' in node && node.body && node.body != null) {
                    traverse(node.body)
                }
            },
            ArrowFunctionExpression(node) {
                if (!hasJSX(node)) funcs.push({ node, start: node.loc.start.line, end: node.loc.start.line })
                if ('body' in node && node.body && node.body != null) {
                    traverse(node.body)
                }
            },
        })
    }

    traverse(ast)
    return funcs
}

function tokenize(ast) {
    // temporary -> not adding spaces between
    const gen = escodegen.generate(ast)
    return gen.replace(/[\t \n]+/g, ' ')
}

module.exports = bugs
