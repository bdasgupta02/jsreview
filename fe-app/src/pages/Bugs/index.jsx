import React, { useState } from 'react'
import { useRepo } from '../../contexts/RepoProvider'
import { useNavigate } from 'react-router-dom'
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs'
import PatchViewer from '../../components/PatchViewer'
import SingleViewer from '../../components/SingleViewer'

// Potential bugs" title
const Bugs = () => {
    const [isViewerMode, setViewerMode] = useState(true)

    let { scan } = useRepo()
    if (scan && Array.isArray(scan)) scan = scan.map(({ smells, main, vuln, ...keepAtrs }) => keepAtrs)

    const navigate = useNavigate()

    const breadcrumbs = (
        <Breadcrumbs>
            <BreadcrumbsItem text="Anlaysis" key="Analysis" onClick={() => navigate('/overview')} />
            <BreadcrumbsItem text="Bugs" key="Bugs" onClick={() => {}} />
        </Breadcrumbs>
    )

    const [details, setDetails] = useState({
        lines: [],
        patches: [],
        path: '',
    })

    const onViewDetails = path => {
        const bugObj = scan.filter(s => s.path === path)[0]
        const bugs = bugObj.bugs
        const lines = bugs.map(i => {
            return {
                start: i.start,
                end: i.end,
            }
        })
        const patches = bugs.map(i => i.patch)
        setDetails({
            lines: lines,
            patches: patches,
            path: path,
            content: bugObj.content,
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
            type={'bugs'}
        />
    ) : (
        <PatchViewer
            onBack={() => setViewerMode(true)}
            details={details}
            title="Bug report"
            desc="Some potential bugs were found in this file, within functions. Please review the function definitions highlighted below."
        />
    )
}

export default Bugs
