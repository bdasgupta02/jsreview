import React, { useState, Fragment } from 'react'
import FullScreen from '../../components/FullScreen'
import Textfield from '@atlaskit/textfield'
import { LoadingButton as Button } from '@atlaskit/button'
import Form, { Field, FormFooter } from '@atlaskit/form'
import styled from 'styled-components'
import SectionMessage from '@atlaskit/section-message'
import constants from '../../constants/constants'
import { useNavigate } from 'react-router-dom'
import { useRepo } from '../../contexts/RepoProvider'

const Search = () => {
    const { scanRepo } = useRepo()
    const navigate = useNavigate()

    const [url, setUrl] = useState('')
    const [isLoading, setLoading] = useState(false)

    const onScan = () => {
        setLoading(true)

        if (!url) {
            setLoading(false)
            return
        }

        // check if a valid url, and is a public github repository
        // show error otherwise

        scanRepo(url) // repo goes here
        navigate('/overview')

        setLoading(false)
    }

    return (
        <FullScreen>
            <Outer id="search-outer">
                <h1 style={{ marginBottom: '0' }}>{constants.name}</h1>
                <h3 style={{ fontWeight: 'normal', marginBottom: '12px', marginTop: '0px' }}>
                    A hybrid automatic code review framework for JavaScript that combines pattern and
                    learning-based approaches
                </h3>
                <SectionMessage title="Dev mode (scan GitHub repositories for review)">
                    <p style={{ margin: '0px' }}>
                        This is to test out the analytics while in development. Later version will include
                        support for pull request code reviews. Please enter a link of a GitHub project below
                        which includes .js files (for instance:{' '}
                        <a href="https://github.com/MartinChavez/Javascript" target="_blank">
                            MartinChavez/Javascript
                        </a>
                        )
                    </p>
                </SectionMessage>
                <div style={{ height: '60px' }} />
                <div style={{ width: '100%' }}>
                    <Form>
                        {({ formProps }) => (
                            <form {...formProps}>
                                <Field label="GitHub Repository" name="gh-url-field">
                                    {({ fieldProps }) => (
                                        <Fragment>
                                            <Textfield
                                                style={{ width: '100%' }}
                                                placeholder="Enter <user>/<repo>"
                                                {...fieldProps}
                                                value={url}
                                                onChange={e => setUrl(e.target.value)}
                                                elemBeforeInput={
                                                    <p style={{ margin: '0px', padding: '0px 8px 0px 12px' }}>
                                                        https://github.com/
                                                    </p>
                                                }
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
