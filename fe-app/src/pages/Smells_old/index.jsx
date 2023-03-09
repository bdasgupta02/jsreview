import React, { useEffect, useState } from 'react'
import { useRepo } from '../../contexts/RepoProvider'
import PageHeader from '@atlaskit/page-header'
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs'
import { useNavigate } from 'react-router-dom'
import Container from '../../components/Container'
import Select from '@atlaskit/select'
import Item from '../../components/Item'
import { useRef } from 'react'
import styled from 'styled-components'
import { N20 } from '@atlaskit/theme/colors'
import { CodeBlock } from '@atlaskit/code'

// format:
// largeFuncs (start, end)
// largeNesting (start, end)
// godVariables (start, end, name)
// godParameters (start, end, name)
// unusedVars (line, name)
// magicLiterals line
// callbackHell (start, end, depth)

// smell (type, title, start, end, tags{name?, depth?}) <- end put == start if line

// each smell should have advice on top of the fileView
// e.g. depth can be reduced
const convertSmell = (type, info) => {}

const Smells = () => {
    const navigate = useNavigate()

    const { scan } = useRepo()

    const [smellData, setSmellData] = useState([])
    const [smellDataDivided, setSmellDataDivided] = useState([]) // sliced pagination
    const [fileData, setFileData] = useState({})

    const [active, setActive] = useState(-1)

    useEffect(() => {
        let { files, acr } = scan
        acr = acr.acr
        let smells = []

        for (let o = 0; o < acr.length; o++) {
            const acrSmells = acr[o].smells
            const path = acr[o].path
            for (let i = 0; i < acrSmells.callbackHell.length; i++) {
                const e = acrSmells.callbackHell[i]
                smells.push({
                    type: 'callbackHell',
                    title: path,
                    start: e.start,
                    end: e.end,
                    tags: [`Depth: ${e.depth}`],
                })
            }

            for (let i = 0; i < acrSmells.godParameters.length; i++) {
                const e = acrSmells.godParameters[i]
                smells.push({
                    type: 'godFuncs',
                    title: path,
                    start: e.start,
                    end: e.end,
                    tags: [`Function: ${e.name}`],
                })
            }

            for (let i = 0; i < acrSmells.godVariables.length; i++) {
                const e = acrSmells.godVariables[i]
                smells.push({
                    type: 'godClasses',
                    title: path,
                    start: e.start,
                    end: e.end,
                    tags: [`Class: ${e.name}`],
                })
            }

            for (let i = 0; i < acrSmells.largeFuncs.length; i++) {
                const e = acrSmells.largeFuncs[i]
                smells.push({
                    type: 'largeFuncs',
                    title: path,
                    start: e.start,
                    end: e.end,
                    tags: [],
                })
            }

            for (let i = 0; i < acrSmells.largeNesting.length; i++) {
                const e = acrSmells.largeNesting[i]
                smells.push({
                    type: 'largeNesting',
                    title: path,
                    start: e.start,
                    end: e.end,
                    tags: [],
                })
            }

            for (let i = 0; i < acrSmells.magicLiterals.length; i++) {
                const e = acrSmells.magicLiterals[i]
                smells.push({
                    type: 'magicLiterals',
                    title: path,
                    start: e,
                    end: e,
                    tags: [],
                })
            }

            // for (let i = 0; i < acrSmells.unusedVars.length; i++) {
            //     const e = acrSmells.unusedVars[i]
            //     smells.push({
            //         type: 'unusedVars',
            //         title: path,
            //         start: e.line,
            //         end: e.line,
            //         tags: [`Variable: ${e.name}`],
            //     })
            // }
        }

        for (let i = smells.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1))
            let temp = smells[i]
            smells[i] = smells[j]
            smells[j] = temp
        }

        //slice
        const pages = smells.length % 10

        setSmellData(smells)

        const fileMap = {}
        for (let i = 0; i < files.length; i++) {
            fileMap[files[i].path] = files[i].content
        }
        setFileData(fileMap)
    }, [])

    const [type, setType] = useState('all')

    const breadcrumbs = (
        <Breadcrumbs>
            <BreadcrumbsItem text="Anlaysis" key="Analysis" onClick={() => navigate('/overview')} />
            <BreadcrumbsItem text="Code smells" key="Code smells" onClick={() => {}} />
        </Breadcrumbs>
    )

    const getFileAtActive = () => {
        return fileData[smellData[active].title]
    }

    const fileView =
        active !== 'undefined' && active !== null && active !== -1 ? (
            <div style={{ width: '100%', marginLeft: '12px', overflow: 'hidden' }}>
                <h3>Test</h3>
                <CodeBlock
                    language="jsx"
                    text={getFileAtActive()}
                    highlight={`${smellData[active].start}-${smellData[active].end}`}
                />
            </div>
        ) : (
            <div style={{ marginLeft: '20px' }}>
                <p>Please click on an item to view details</p>
            </div>
        )

    const listRef = useRef()

    // if not selected just show only smells? (v2 perhaps)
    // say smells are warning signs of deeper problems
    // make this outer cover a container for double rows
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
            }}>
            <Container>
                <PageHeader breadcrumbs={breadcrumbs}>Code smells</PageHeader>
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                    <div style={{ flex: 1 }}>
                        <label htmlFor="type-select" style={{ fontSize: '14px' }}>
                            Type
                        </label>
                        <div style={{ fontSize: '14px', marginTop: '2px', width: '100%' }}>
                            <Select
                                inputId="type-select"
                                className="single-select"
                                classNamePrefix="react-select"
                                isClearable={false}
                                defaultValue="all"
                                options={[
                                    { label: 'All', value: 'all' },
                                    { label: 'Large functions', value: 'largeFuncs' },
                                    { label: 'Large nesting', value: 'largeNesting' },
                                    { label: 'God functions', value: 'godFuncs' },
                                    { label: 'God classes', value: 'godClasses' },
                                    //{ label: 'Unused variables', value: 'unusedVars' },
                                    { label: 'Magic literal strings', value: 'magicLiterals' },
                                    { label: 'Callback hell', value: 'callbackHell' },
                                ]}
                                placeholder="All"
                                value={type}
                                onChange={e => {
                                    setType(e)
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ flex: 1 }}></div>
                </div>
            </Container>
            <div style={{ height: '100%', paddingTop: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
                    <div style={{ flex: 1, height: '100%', backgroundColor: N20 }}>
                        <AntiScroll
                            style={{
                                height:
                                    listRef.current && listRef.current.offsetTop
                                        ? `calc(100vh - ${listRef.current.offsetTop}px - 60px)`
                                        : '0px',
                            }}
                            ref={listRef}>
                            {smellData.map((e, i) => (
                                <div style={{ paddingRight: '12px', marginTop: '8px' }}>
                                    <Item
                                        key={i}
                                        type={e.type}
                                        title={e.title}
                                        tags={e.tags ? e.tags : []}
                                        isActive={
                                            active !== 'undefined' && active !== null ? active === i : false
                                        }
                                        onClick={() => setActive(i)}
                                        isPath={true}
                                    />
                                </div>
                            ))}
                        </AntiScroll>
                    </div>
                    <div style={{ flex: 3, backgroundColor: N20 }}>
                        <AntiScroll
                            style={{
                                margin: '0px',
                                height:
                                    listRef.current && listRef.current.offsetTop
                                        ? `calc(100vh - ${listRef.current.offsetTop}px - 60px)`
                                        : '0px',
                            }}>
                            {fileView}
                        </AntiScroll>
                    </div>
                </div>
            </div>
        </div>
    )
}

const AntiScroll = styled.div`
    margin-left: 30px;
    overflow-y: scroll;
    overflow-x: hidden;

    &::-webkit-scrollbar {
        width: 3px;
    }

    &::-webkit-scrollbar-track {
        background: #00000000;
    }

    &::-webkit-scrollbar-thumb {
        background: #a1a1a1;
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #a1a1a1;
        width: 6px;
    }

    &::-webkit-scrollbar:horizontal {
        height: 3px;
    }
`

export default Smells
