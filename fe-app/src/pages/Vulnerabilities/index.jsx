import React, { useState } from 'react'
import { useRepo } from '../../contexts/RepoProvider'
import { useNavigate } from 'react-router-dom'
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs'
import SingleViewer from '../../components/SingleViewer'
import CodeViewer from '../../components/CodeViewer'

// Complex, poorly design code might be vulnerable
// Did
// Like a hotspot
const Vulnerabilities = () => {
    const [isViewerMode, setViewerMode] = useState(true)

    let { scan } = useRepo()
    if (scan && Array.isArray(scan)) scan = scan.map(({ smells, main, bugs, ...keepAtrs }) => keepAtrs)
    console.log(scan)

    const navigate = useNavigate()

    const breadcrumbs = (
        <Breadcrumbs>
            <BreadcrumbsItem text="Anlaysis" key="Analysis" onClick={() => navigate('/overview')} />
            <BreadcrumbsItem text="Vulnerabilities" key="Vulnerabilities" onClick={() => {}} />
        </Breadcrumbs>
    )

    const [details, setDetails] = useState({
        title: 'Vulnerable hotspot report',
        desc: 'These function definitions are poorly designed and overly complex, please re-check these areas to ensure there are no vulnerabilities',
        content: '',
        path: '',
        lines: [], // start, end
        names: [],
    })

    const onViewDetails = path => {
        const vulnObj = scan.filter(s => s.path === path)[0]
        const vuln = vulnObj.vuln
        const lines = vuln.map(i => {
            return {
                start: i.start,
                end: i.end,
            }
        })
        setDetails({
            ...details,
            lines: lines,
            path: path,
            content: vulnObj.content,
        })
        setViewerMode(false)
        window.scrollTo(0, 0)
    }

    return isViewerMode ? (
        <SingleViewer
            fileList={scan}
            header={'Potential bugs'}
            breadcrumbs={breadcrumbs}
            onClick={onViewDetails}
            type={'vuln'}
        />
    ) : (
        <CodeViewer
            onBack={() => setViewerMode(true)}
            details={details}
            bread1="Vulnerabilities"
            bread2="Report"
        />
    )
}

export default Vulnerabilities
