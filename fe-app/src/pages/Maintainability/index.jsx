import React, { useState } from 'react'
import { useRepo } from '../../contexts/RepoProvider'
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs'
import Viewer from '../../components/Viewer'
import { useNavigate } from 'react-router-dom'
import BulletListIcon from '@atlaskit/icon/glyph/bullet-list'
import CodeViewer from '../../components/CodeViewer'
import { useEffect } from 'react'

const Maintainability = () => {
    const [isViewerMode, setViewerMode] = useState(true)

    let { scan } = useRepo()
    if (scan && Array.isArray(scan)) scan = scan.map(({ bugs, smells, vuln, ...keepAtrs }) => keepAtrs)
    console.log(scan)

    const navigate = useNavigate()

    const breadcrumbs = (
        <Breadcrumbs>
            <BreadcrumbsItem text="Anlaysis" key="Analysis" onClick={() => navigate('/overview')} />
            <BreadcrumbsItem text="Maintainability" key="Maintainability" onClick={() => {}} />
        </Breadcrumbs>
    )

    const types = [
        {
            label: 'Code duplicates',
            value: 'codeDuplicates',
            desc: 'Copy pasted code',
            icon: <BulletListIcon label="" />,
        },
        {
            label: 'No documentation',
            value: 'noDocumentation',
            desc: 'Functions and Classes',
            icon: <BulletListIcon label="" />,
        },
    ]

    const [details, setDetails] = useState({
        title: '',
        desc: '',
        content: '',
        path: '',
        lines: [], // start, end
        names: [],
    })

    const onViewDetails = (path, main) => {
        const mainObj = scan.filter(s => s.path === path)[0]
        const innerMain = mainObj.main[main]
        if (main === 'codeDuplicates') {
            const lines = innerMain.map(i => {
                return {
                    start: i.start,
                    end: i.end,
                }
            })
            setDetails({
                title: 'Code duplicates',
                desc: 'Copy pasted code can undermine the long term maintainability of code, and prevent conducting any changes.',
                content: mainObj.content,
                lines: lines,
                names: [],
                path,
            })
        } else if (main === 'noDocumentation') {
            const lines = innerMain.map(i => {
                return {
                    start: i.start,
                    end: i.end,
                }
            })
            const names = innerMain.map(i => i.name)
            setDetails({
                title: 'Lack of documentation for functions and classes',
                desc: 'Consider adding some comments to let your team understand what a function or class does.',
                content: mainObj.content,
                lines: lines,
                names: names,
                path,
            })
        }
        setViewerMode(false)
        window.scrollTo(0, 0)
    }

    return isViewerMode ? (
        <Viewer
            types={types}
            fileList={scan}
            header={'Maintainability risks'}
            breadcrumbs={breadcrumbs}
            issueType={'maintainability'}
            dbType={'main'}
            onClick={onViewDetails}
        />
    ) : (
        <CodeViewer onBack={() => setViewerMode(true)} details={details} />
    )
}

export default Maintainability
