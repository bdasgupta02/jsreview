import React, { useState, Fragment } from 'react'
import FullScreen from '../../components/FullScreen'
import Textfield from '@atlaskit/textfield'
import { LoadingButton as Button } from '@atlaskit/button'
import Form, { Field, FormFooter } from '@atlaskit/form'
import styled from 'styled-components'
import SectionMessage from '@atlaskit/section-message'
import constants from '../../constants/constants'
import { useNavigate } from 'react-router-dom'

const Search = () => {
    const navigate = useNavigate()

    const [url, setUrl] = useState('https://github.com/bdasgupta02/luminus2')
    const [isLoading, setLoading] = useState(false)

    const onScan = () => {
        setLoading(true)

        try {
            navigate('/overview')
        } catch (e) {}

        setLoading(false)
    }

    return (
        <FullScreen>
            <Outer id="search-outer">
                <h1 style={{ marginBottom: '0' }}>{constants.name}</h1>
                <h3 style={{ fontWeight: 'normal', marginBottom: '12px', marginTop: '0px' }}>
                    An automatic code review framework for JavaScript in front-end projects
                </h3>
                <SectionMessage title="Dev mode (scan GitHub repositories for review)">
                    <p style={{ margin: '0px' }}>
                        This is to test out the analytics while in development. Later version will include
                        support for pull request code reviews. Please enter a link of a GitHub project below
                        which includes [.js/.jsx] files (for instance:{' '}
                        <a href="https://github.com/bdasgupta02/luminus2" target="_blank">
                            https://github.com/bdasgupta02/luminus2
                        </a>
                        )
                    </p>
                </SectionMessage>
                <div style={{ height: '60px' }} />
                <div style={{ width: '100%' }}>
                    <Form>
                        {({ formProps }) => (
                            <form {...formProps}>
                                <Field label="GitHub URL" name="gh-url-field">
                                    {({ fieldProps }) => (
                                        <Fragment>
                                            <Textfield
                                                style={{ width: '100%' }}
                                                placeholder="Enter a GitHub URL here"
                                                {...fieldProps}
                                                value={url}
                                                onChange={e => setUrl(e.target.value)}
                                            />
                                        </Fragment>
                                    )}
                                </Field>
                                <FormFooter>
                                    <Button
                                        appearance={url && url !== '' ? 'primary' : null}
                                        isLoading={isLoading}
                                        onClick={onScan}>
                                        Scan
                                    </Button>
                                </FormFooter>
                            </form>
                        )}
                    </Form>
                </div>
            </Outer>
        </FullScreen>
    )
}

const Outer = styled.div`
    margin: auto;
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
`

export default Search
