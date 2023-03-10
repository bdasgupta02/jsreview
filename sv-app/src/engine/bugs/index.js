const acorn = require('acorn')
const walk = require('acorn-walk')
const jsx = require('acorn-jsx')
const escodegen = require('escodegen')
const axios = require('axios')
const eslint = require('eslint')

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
                const isBug = detectBug(pred, funcs[i].node)
                console.log(isBug)
                if (isBug) {
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

function checkSyntax(code) {
    const eslint = require('eslint')
    const CLIEngine = eslint.CLIEngine
    const cli = new CLIEngine({
        useEslintrc: false,
        rules: {},
    })

    const report = cli.executeOnText(code)
    return report.errorCount === 0
}

const getBlock = func => {
    walk.simple(func, {
        BlockStatement(node) {
            func = node
            return
        },
    })
    return func
}

const getStructure = obj => {
    if (!obj) {
        return null
    } else if (Array.isArray(obj)) {
        return obj.map(e => getStructure(e))
    } else if (typeof obj === 'object') {
        const filtered = {}
        for (const key in obj) {
            const val = obj[key]
            if (!val || key === 'loc') continue
            if (Array.isArray(val) || typeof val === 'object') {
                filtered[key] = getStructure(val)
            } else if (key === 'type') {
                filtered[key] = val
            }
        }
        return filtered
    }
}

const detectBug = (s, b_ast) => {
    // smaller will always be predicted

    s_split = s.indexOf('(')
    s_second = s.slice(s_split + 1)
    s = 'function f(' + s_second
    const isValid = checkSyntax(s)
    if (!isValid) return false

    const s_ast = getBlock(acorn.parse(s))
    const s_types = getStructure(s_ast)
    const b_types = getStructure(b_ast)
    const s_str = JSON.stringify(s_types)
    const b_str = JSON.stringify(b_types)
    const isMatch = b_str.includes(s_str)
    return !isMatch
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
