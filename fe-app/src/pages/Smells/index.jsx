import React, { useState } from 'react'
import { useRepo } from '../../contexts/RepoProvider'
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs'
import Viewer from '../../components/MultiViewer'
import { useNavigate } from 'react-router-dom'
import BulletListIcon from '@atlaskit/icon/glyph/bullet-list'
import CodeViewer from '../../components/CodeViewer'

const Smells = () => {
    const [isViewerMode, setViewerMode] = useState(true)

    let { scan } = useRepo()
    if (scan && Array.isArray(scan)) scan = scan.map(({ bugs, main, vuln, ...keepAtrs }) => keepAtrs)

    const navigate = useNavigate()

    const breadcrumbs = (
        <Breadcrumbs>
            <BreadcrumbsItem text="Anlaysis" key="Analysis" onClick={() => navigate('/overview')} />
            <BreadcrumbsItem text="Code smells" key="Code smells" onClick={() => {}} />
        </Breadcrumbs>
    )

    const types = [
        {
            label: 'Large functions',
            value: 'largeFuncs',
            desc: 'Many params',
            icon: <BulletListIcon label="" />,
        },
        {
            label: 'High nesting',
            value: 'largeNesting',
            desc: 'Deeply nested',
            icon: <BulletListIcon label="" />,
        },
        {
            label: 'God functions',
            value: 'godVariables',
            desc: 'Many responsibilities',
            icon: <BulletListIcon label="" />,
        },
        {
            label: 'God classes',
            value: 'godParameters',
            desc: 'Massive classes',
            icon: <BulletListIcon label="" />,
        },
        {
            label: 'Magic literals',
            value: 'magicLiterals',
            desc: 'Hardcoded values',
            icon: <BulletListIcon label="" />,
        },
        {
            label: 'Callback hell',
            value: 'callbackHell',
            desc: 'Nested callbacks',
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

    const onViewDetails = (path, smell) => {
        const smellObj = scan.filter(s => s.path === path)[0]
        const innerSmell = smellObj.smells[smell]
        if (smell === 'largeFuncs') {
            const lines = innerSmell.map(i => {
                return {
                    start: i.start,
                    end: i.end,
                }
            })
            setDetails({
                title: 'Large Functions',
                desc: 'Functions which have a lot of parameters. Having a lot of parameters might undermine readability, reusability and point to too many repsonsibilities.',
                content: smellObj.content,
                lines: lines,
                names: [],
                path,
            })
        } else if (smell === 'largeNesting') {
            const lines = innerSmell.map(i => {
                return {
                    start: i.start,
                    end: i.end,
                }
            })
            setDetails({
                title: 'High nesting',
                desc: 'Nesting too much can make it hard for others to read the code, and might cause unforeseen dependency and resusability issues.',
                content: smellObj.content,
                lines: lines,
                names: [],
                path,
            })
        } else if (smell === 'godVariables') {
            const lines = innerSmell.map(i => {
                return {
                    start: i.start,
                    end: i.end,
                }
            })
            const names = innerSmell.map(i => i.name)
            setDetails({
                title: 'God functions',
                desc: 'These functions handle too many variables and might have too much responsibility. Consider breaking them down into smaller more scalable functions.',
                content: smellObj.content,
                lines: lines,
                names: names,
                path,
            })
        } else if (smell === 'godParameters') {
            const lines = innerSmell.map(i => {
                return {
                    start: i.start,
                    end: i.end,
                }
            })
            const names = innerSmell.map(i => i.name)
            setDetails({
                title: 'God classes',
                desc: 'These classes handle too many attributes and might have too much responsibility. Consider breaking them down into smaller more scalable classes.',
                content: smellObj.content,
                lines: lines,
                names: names,
                path,
            })
        } else if (smell === 'magicLiterals') {
            const lines = innerSmell.map(i => {
                return {
                    start: i,
                    end: i,
                }
            })
            setDetails({
                title: 'Magic literals',
                desc: 'Some values have been hardcoded on this file. This can lead to inconsistencies, redundancies and errors.',
                content: smellObj.content,
                lines: lines,
                names: [],
                path,
            })
        } else if (smell === 'callbackHell') {
            const lines = innerSmell.map(i => {
                return {
                    start: i.start,
                    end: i.end,
                }
            })
            setDetails({
                title: 'Callback hell',
                desc: 'Too many callbacks have been nested within each other. Consider alternatives instead of nesting callbacks.',
                content: smellObj.content,
                lines: lines,
                names: [],
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
            header={'Code smells'}
            breadcrumbs={breadcrumbs}
            issueType={'smell'}
            dbType={'smells'}
            onClick={onViewDetails}
        />
    ) : (
        <CodeViewer onBack={() => setViewerMode(true)} details={details} bread1="Smells" bread2="Report" />
    )
}

export default Smells
