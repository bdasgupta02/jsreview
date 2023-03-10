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

const SingleViewer = ({ fileList, header, breadcrumbs, onClick, type }) => {
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
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    marginTop: '20px',
                    height: '100%',
                    width: '100%',
                    backgroundColor: N20,
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
                            const length = e[type].length
                            if (length === 0) return null
                            return (
                                <HoverDiv
                                    key={`k-renderlist-${length}${e.path}`}
                                    style={{
                                        backgroundColor: 'white',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        marginBottom: '12px',
                                    }}
                                    onClick={() => onClick(e.path)}>
                                    <p style={{ color: N500, margin: '0px' }}>{e.path}</p>
                                    <div style={{ flex: 1 }} />
                                    <div>
                                        <Badge>{length}</Badge>
                                    </div>
                                </HoverDiv>
                            )
                        })}
                </div>
            </div>
        </div>
    )
}

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

export default SingleViewer
