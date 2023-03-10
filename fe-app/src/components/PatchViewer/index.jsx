import React, { useState } from 'react'
import Container from '../Container'
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs'
import Lozenge from '@atlaskit/lozenge'
import PageHeader from '@atlaskit/page-header'
import { CodeBlock } from '@atlaskit/code'
import CrossIcon from '@atlaskit/icon/glyph/cross'
import { N100 } from '@atlaskit/theme/colors'
import Tabs, { Tab, TabList, TabPanel } from '@atlaskit/tabs'

const PatchViewer = ({ onBack, details, title, desc }) => {
    const { path, lines, patches, content } = details

    const breadcrumbs = (
        <Breadcrumbs>
            <BreadcrumbsItem text="Anlaysis" key="Analysis" onClick={() => navigate('/overview')} />
            <BreadcrumbsItem text="Bugs" key="Bugs" onClick={onBack} />
            <BreadcrumbsItem text="Report" key="Report" onClick={() => {}} />
        </Breadcrumbs>
    )

    let str = ''
    for (let i = 0; i < lines.length; i++) {
        str += `${lines[i].start}-${lines[i].end}`
        if (i !== lines[i].length - 1) str += ','
    }

    const [idx, setIdx] = useState(0)

    return (
        <Container>
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                <PageHeader breadcrumbs={breadcrumbs}>{title}</PageHeader>
                <div style={{ flex: 1 }} />
                <div style={{ marginTop: '20px', cursor: 'pointer' }} onClick={onBack}>
                    <CrossIcon />
                </div>
            </div>
            <p style={{ margin: '0px 0px 40px 0px' }}>{desc}</p>
            <p style={{ fontSize: '14px', color: N100 }}>{path}</p>
            <Tabs onChange={index => setIdx(index)} id="tabs">
                <TabList>
                    <Tab>Areas</Tab>
                    <Tab>Possible patches</Tab>
                </TabList>
                <TabPanel>
                    <div style={{ width: '100%' }}>
                        <CodeBlock language="jsx" text={content} highlight={str} />
                    </div>
                </TabPanel>
                <TabPanel>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                        {patches.map(e => (
                            <div style={{ width: '100%', marginTop: '20px' }}>
                                <CodeBlock language="jsx" text={e} />
                            </div>
                        ))}
                    </div>
                </TabPanel>
            </Tabs>
        </Container>
    )
}

export default PatchViewer
