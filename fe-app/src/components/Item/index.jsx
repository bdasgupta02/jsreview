import React, { useState } from 'react'
import { animated, useSpring } from 'react-spring'
import { N700 } from '@atlaskit/theme/colors'
import { SimpleTag as Tag } from '@atlaskit/tag'

const Item = ({ type, title, tags, isActive, onClick, isPath }) => {
    const [isHover, setHover] = useState(false)

    const shadow = useSpring({
        boxShadow: isHover || isActive ? '5px 5px 5px #00000040' : '2px 2px 2px #00000040',
    })

    if (type === 'callbackHell') {
        type = 'Callback Hell'
    } else if (type === 'magicLiterals') {
        type = 'Magic Literal'
    } else if (type === 'unusedVars') {
        type = 'Unused Variable'
    } else if (type === 'largeNesting') {
        type = 'Large Nesting'
    } else if (type === 'godClasses') {
        type = 'God Class'
    } else if (type === 'godFuncs') {
        type = 'God Function'
    } else if (type === 'largeFuncs') {
        type = 'Large Function'
    }

    if (isPath) {
        const titleSplit = title.split('/')
        title = titleSplit[titleSplit.length - 1]
        title = `File: ${title}`
    }

    return (
        <animated.div
            style={{ width: '100%', cursor: 'pointer', borderRadius: '3px', backgroundColor: 'white', ...shadow }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '12px', marginRight: '12px' }}>
                <div
                    style={{ textTransform: 'uppercase', fontSize: '12px', color: N700, fontWeight: 'bold' }}>
                    {type}
                </div>
                <p style={{ fontSize: '15px', margin: '0px 0px 12px 0px' }}>{title}</p>
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                    {tags.map(e => (
                        <Tag text={e} color="grey" />
                    ))}
                </div>
            </div>
        </animated.div>
    )
}

export default Item
