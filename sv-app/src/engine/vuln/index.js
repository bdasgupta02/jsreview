const acorn = require('acorn')
const walk = require('acorn-walk')
const jsx = require('acorn-jsx')
const escomplex = require('escomplex')
const escodegen = require('escodegen')

const vulnerabilities = (content) => {
    try {
        const result = []
        const funcs = extrFunctions(content)
        for (let i = 0; i < funcs.length; i++) {
            try {

            } catch (eInner) {
                console.log(`Error: ${eInner}`)
            }
        }
        return result
    } catch (e) {
        console.log(`Error in vuln: ${e}`)
        return []
    }
}

const getMetrics = (ast) => {
    const funcStr = escodegen.generate(ast)
    const metrics = escomplex.analyse(funcStr).aggregate
    return {
        mccc: metrics.cyclomatic,
        loc: 20,
        tlloc: 16,
        tloc: 21,
        hor_d: 9,
        hon_d: 25,
        hon_t: 47,
        hvoc: 34,
        hdiff: 8.46,
        cycl: 23.07692308
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

module.exports = vulnerabilities
