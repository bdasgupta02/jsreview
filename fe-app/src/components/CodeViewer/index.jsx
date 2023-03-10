import React from 'react'
import Container from '../Container'
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs'
import Lozenge from '@atlaskit/lozenge'
import PageHeader from '@atlaskit/page-header'
import { CodeBlock } from '@atlaskit/code'
import CrossIcon from '@atlaskit/icon/glyph/cross'
import { N100 } from '@atlaskit/theme/colors'

const CodeViewer = ({ onBack, details, bread1, bread2 }) => {
    const { title, desc, content, lines, names, path } = details

    const breadcrumbs = (
        <Breadcrumbs>
            <BreadcrumbsItem text="Anlaysis" key="Analysis" onClick={() => navigate('/overview')} />
            <BreadcrumbsItem text={bread1} key={bread1} onClick={onBack} />
            <BreadcrumbsItem text={bread2} key={bread2} onClick={() => {}} />
        </Breadcrumbs>
    )

    let str = ''
    for (let i = 0; i < lines.length; i++) {
        str += `${lines[i].start}-${lines[i].end}`
        if (i !== lines[i].length - 1) str += ','
    }

    return (
        <Container>
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                <PageHeader breadcrumbs={breadcrumbs}>{title}</PageHeader>
                <div style={{ flex: 1 }} />
                <div style={{ marginTop: '20px', cursor: 'pointer' }} onClick={onBack}>
                    <CrossIcon />
                </div>
            </div>
            <p style={{ margin: 0 }}>{desc}</p>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    width: 'fit-content',
                    marginTop: '6px',
                }}>
                {names.map(n => (
                    <div>
                        <Lozenge>{n}</Lozenge>
                    </div>
                ))}
            </div>
            <p style={{ fontSize: '14px', color: N100, marginTop: '40px' }}>{path}</p>
            <CodeBlock language="jsx" text={content} highlight={str} />
        </Container>
    )
}

export default CodeViewer
