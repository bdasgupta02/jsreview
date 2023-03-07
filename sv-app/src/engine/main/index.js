const acorn = require('acorn')
const walk = require('acorn-walk')
const jsx = require('acorn-jsx')

const maintainability = code => {
    let output = {}

    const tryAdd = (callback, term) => {
        try {
            const toAdd = callback()
            output[term] = toAdd
        } catch (e) {
            console.log('Error in maintainability: ' + e)
            output[term] = []
        }
    }

    tryAdd(() => mergeOverlaps(detectCodeDuplication(code)), 'codeDuplicates')
    tryAdd(() => checkDocAbove(code), 'noDocumentation')
    return output
}

const detectCodeDuplication = (code, maxFragmentSize = 50, minFragmentSize = 2) => {
    const lines = code.split('\n')
    const fragments = {}
    const hashBase = 31
    const hashMod = 1e9 + 9
    const duplicates = []

    const computeHash = str => {
        let hash = 0
        let pow = 1
        for (let i = 0; i < str.length; i++) {
            hash = (hash + pow * str.charCodeAt(i)) % hashMod
            pow = (pow * hashBase) % hashMod
        }
        return hash
    }

    const stripCommentsAndStrings = code => {
        const regex = /\/\/.*|\/\*[\s\S]*?\*\/|'(?:\\.|[^\\'])*'|"(?:\\.|[^\\"])*"/g
        return code.replace(regex, '')
    }

    for (let i = 0; i < lines.length; i++) {
        for (let j = i + minFragmentSize - 1; j < lines.length && j < i + maxFragmentSize; j++) {
            const fragment = lines.slice(i, j + 1).join('\n')
            if (fragment.trim().split('\n').length >= minFragmentSize) {
                const strippedFragment = stripCommentsAndStrings(fragment)
                const hash = computeHash(strippedFragment)
                if (fragments[hash]) {
                    fragments[hash].push({ start: i, end: j })
                } else {
                    fragments[hash] = [{ start: i, end: j }]
                }
            }
        }
    }

    for (const hash in fragments) {
        const lines = fragments[hash]
        if (lines.length > 1) {
            let minStart = Infinity
            let maxEnd = -Infinity
            for (const line of lines) {
                const start = line.start
                const end = line.end
                if (start < minStart || end > maxEnd) {
                    duplicates.push({ start: start + 1, end: end + 1 })
                    minStart = Math.min(minStart, start)
                    maxEnd = Math.max(maxEnd, end)
                }
            }
        }
    }

    return duplicates
}

const mergeOverlaps = fragments => {
    fragments.sort((a, b) => a.start - b.start)

    const mergedFragments = []
    if (fragments.length <= 0) return mergedFragments

    let currentFragment = fragments[0]
    for (let i = 1; i < fragments.length; i++) {
        const fragment = fragments[i]
        if (fragment.start <= currentFragment.end) {
            currentFragment.end = Math.max(currentFragment.end, fragment.end)
        } else {
            mergedFragments.push(currentFragment)
            currentFragment = fragment
        }
    }
    mergedFragments.push(currentFragment)
    return mergedFragments
}

const checkDocAbove = code => {
    const commentsEloc = new Set()

    const ast = acorn.Parser.extend(jsx()).parse(code, {
        ecmaVersion: 2022,
        sourceType: 'module',
        locations: true,
        plugins: { jsx: true },
        onComment: (_, text, start, end, sloc, eloc) => {
            commentsEloc.add(eloc.line)
        },
    })

    const result = []

    const checkDoc = node => {
        try {
            if (!commentsEloc.has(node.loc.start.line - 1)) {
                result.push({
                    name: node.id && node.id.name ? node.id.name : '<anonymous>',
                    start: node.loc.start.line,
                    end: node.loc.end.line,
                })
            }
        } catch (e) {
            console.log(e)
        }
    }
    
    walk.recursive(ast, null, {
        JSXElement(node) {
            return
        },
        JSXFragment(node) {
            return
        },
        FunctionDeclaration(node) {
            checkDoc(node)
        },
        ClassDeclaration(node) {
            checkDoc(node)
        },
        ArrowFunctionExpression(node) {
            checkDoc(node)
        },
    })

    return result
}

module.exports = maintainability
