import React from 'react'
import Textfield from '@atlaskit/textfield'
import SearchIcon from '@atlaskit/icon/glyph/search'
import PageHeader from '@atlaskit/page-header'
import Container from '../Container'
import { N20, N500 } from '@atlaskit/theme/colors'
import { useState } from 'react'
import { ButtonItem, Section, SideNavigation } from '@atlaskit/side-navigation'
import BacklogIcon from '@atlaskit/icon/glyph/backlog'
import Badge from '@atlaskit/badge'
import styled from 'styled-components'

// for smells, main - use ArrayViewer for others
const Viewer = ({ types, fileList, onClick, header, breadcrumbs, issueType, dbType }) => {
    const [active, setActive] = useState('')

    return (
        <div
            style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FAFBFC',
            }}>
            <Container>
                <PageHeader breadcrumbs={breadcrumbs}>{header}</PageHeader>
                <div style={{ maxWidth: '600px' }}>
                    <Textfield
                        placeholder="Search for a file or path"
                        elemBeforeInput={
                            <div style={{ margin: '2px 0px 0px 8px' }}>
                                <SearchIcon size="small" borderColor="transparent" />
                            </div>
                        }
                    />
                </div>
            </Container>
            <div
                style={{ flex: 1, display: 'flex', flexDirection: 'row', marginTop: '20px', height: '100%' }}>
                <SideNavWrapper>
                    <SideNavigation label="type">
                        <div style={{ padding: '0px 30px 30px 30px' }}>
                            <Section>
                                <ButtonItem
                                    description={`Every ${issueType}`}
                                    isSelected={active === ''}
                                    iconBefore={<BacklogIcon label="" />}
                                    onClick={() => setActive('')}>
                                    {'All'}
                                </ButtonItem>
                                {types.map((e, i) => (
                                    <ButtonItem
                                        key={`b${i}`}
                                        description={e.desc}
                                        isSelected={active === e.value}
                                        iconBefore={e.icon}
                                        onClick={() => setActive(e.value)}>
                                        {e.label}
                                    </ButtonItem>
                                ))}
                            </Section>
                        </div>
                    </SideNavigation>
                </SideNavWrapper>
                <div
                    style={{
                        flex: 4,
                        backgroundColor: N20,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                    <div
                        style={{
                            minWidth: '400px',
                            width: '60%',
                            marginTop: '20px',
                            padding: '0px 30px 0px 30px',
                        }}>
                        {fileList &&
                            Array.isArray(fileList) &&
                            fileList.map(e => {
                                const keys = Object.keys(e[dbType])
                                const filtered = []
                                for (let i = 0; i < keys.length; i++) {
                                    const key = keys[i]
                                    if (active !== '' && active !== key) continue
                                    filtered.push(key)
                                }

                                const renderList = []
                                for (let i = 0; i < filtered.length; i++) {
                                    const typeLabel = types.filter(t => {
                                        return t.value === filtered[i]
                                    })

                                    const number = e[dbType][filtered[i]].length
                                    if (typeLabel.length === 0 || number === 0) continue
                                    renderList.push({ issue: typeLabel[0].label, number: number, value: filtered[i] })
                                }

                                if (renderList.length === 0) return null

                                // check if exists
                                return (
                                    <div style={{ marginBottom: '20px' }}>
                                        <p style={{ color: N500, margin: '0px' }}>{e.path}</p>
                                        {renderList.map(r => (
                                            <HoverDiv
                                                key={`k-renderlist-${r.issue}${r.number}`}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    backgroundColor: 'white',
                                                    marginTop: '6px',
                                                    padding: '12px',
                                                    borderRadius: '3px',
                                                }}
                                                onClick={() => onClick(e.path, r.value)}>
                                                <div
                                                    style={{
                                                        fontWeight: 'bold',
                                                        fontSize: '14px',
                                                        opacity: 0.7,
                                                    }}>
                                                    {r.issue}
                                                </div>
                                                <div style={{ flex: 1 }} />
                                                <Badge>{r.number}</Badge>
                                            </HoverDiv>
                                        ))}
                                    </div>
                                )
                            })}
                    </div>
                </div>
            </div>
        </div>
    )
}

const SideNavWrapper = styled.div`
    position: -webkit-sticky;
    position: sticky;
    width: 300px;
    top: 80px;
    align-self: flex-start;
`

const HoverDiv = styled.div`
    cursor: pointer;
    display: flex;
    flex-direction: row;
    margin-top: 6px;
    padding: 12px;
    border-radius: 3px;
    background-color: #ffffff;

    transition: box-shadow 0.3s;

    :hover {
        box-shadow: 3px 5px 11px rgba(33, 33, 33, 0.2);
    }
`

export default Viewer
