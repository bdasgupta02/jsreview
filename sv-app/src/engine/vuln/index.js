const acorn = require('acorn')
const walk = require('acorn-walk')
const jsx = require('acorn-jsx')
const escomplex = require('escomplex')
const escodegen = require('escodegen')
const axios = require('axios')

const vulnerabilities = async content => {
    try {
        const result = []
        const funcs = extrFunctions(content)
        for (let i = 0; i < funcs.length; i++) {
            try {
                const metrics = getMetrics(funcs[i].node)
                const pred = await predVuln(metrics)
                if (pred) result.push({ start: funcs[i].start, end: funcs[i].end })
            } catch (eInner) {
                console.log(`Error in vuln: ${eInner}`)
            }
        }
        return result
    } catch (e) {
        console.log(`Error in vuln: ${e}`)
        return []
    }
}

const predVuln = async metrics => {
    const resp = await axios.post(`${process.env.SV_MODELS}/predict/multiple/vuln`, [metrics], {
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    })

    const data = resp.data
    return data[0] === 1
}

const getMetrics = ast => {
    let funcStr = escodegen.generate(ast)
    if (ast && ast.type && ast.type === 'ArrowFunctionExpression') {
        funcStr = 'const f = ' + funcStr
    } else if (ast && ast.type && ast.type === 'FunctionExpression') {
        func_split = funcStr.indexOf('(')
        func_second = funcStr.slice(func_split + 1)
        funcStr = 'function f(' + func_second
    }

    let metrics = escomplex.analyse(funcStr)
    if ('functions' in metrics && metrics.functions.length > 0) {
        metrics = metrics.functions[0]
    } else {
        metrics = metrics.aggregate
    }
    const halstead = metrics.halstead
    return {
        mccc: metrics.cyclomatic,
        numpar: metrics.params,
        hor_d: halstead.operators.distinct,
        hon_d: halstead.operands.distinct,
        hon_t: halstead.operators.total,
        hlen: halstead.length,
        hvoc: halstead.vocabulary,
        hdiff: halstead.difficulty,
        params: metrics.params,
        cycl_dens: metrics.cyclomaticDensity,
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

module.exports = vulnerabilities
