const acorn = require('acorn')
const walk = require('acorn-walk')
const jsx = require('acorn-jsx')
const escodegen = require('escodegen')
const compareAst = require('compare-ast')
const axios = require('axios')

const bugs = async content => {
    // extract functions
    // tokenize
    // predict
    // match (if its similar its false)
    // return {defect:bool,path:str}
    try {
        const result = []
        const funcs = extrFunctions(content)
        for (let i = 0; i < funcs.length; i++) {
            try {
                const tokenized = tokenize(funcs[i].node)
                const pred = await predRefine(tokenized)
                if (pred === 'error') {
                    continue
                }
                const isDefect = match(tokenized, pred)
                if (isDefect) {
                    result.push({ start: funcs[i].start, end: funcs[i].end, patch: pred })
                }
            } catch (eInner) {
                console.log(`Error: ${eInner}`)
            }
        }
        return result
    } catch (e) {
        console.log(`Error: ${e}`)
        return []
    }
}

const match = (funcStr, predStr) => {
    try {
        compareAst(funcStr, predStr)
        return true
    } catch (e) {
        return false
    }
}

const predRefine = async tokenized => {
    const resp = await axios.post(
        `${process.env.SV_MODELS}/predict/multiple/bugs`,
        { funcs: [tokenized] },
        {
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        },
    )

    console.dir(resp)

    const data = resp.data
    if (data && Array.isArray(data) && data.length > 0 && 'generated_text' in data[0]) {
        return data[0]['generated_text']
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
        console.log('Issue in smells/hasJSX ' + e)
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
