import React, { useState, useContext, createContext } from 'react'
import Spinner from '@atlaskit/spinner'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

// v2: add local storage?
// make scanning eventually modular once details are in

export const RepoContext = createContext()

export const useRepo = () => {
    return useContext(RepoContext)
}

const RepoProvider = ({ children }) => {
    const url = 'http://127.0.0.1:8010'
    const navigate = useNavigate()

    const [isPending, setPending] = useState(false)

    const [hasRepo, setHasRepo] = useState(false)
    const [isScanInner, setScanInner] = useState({
        // v2
        bugs: false,
        smells: false,
        main: false,
        vuln: false,
    })
    const [scan, setScan] = useState({})
    const [err, setErr] = useState('Please wait.')
    const [sha, setSha] = useState('')
    const [repo, setRepo] = useState('')

    const scannerDaemon = async repo => {
        // v2:
        // set has repo true after searching github for files
        // then set another useState true for "searching inner" to indicate search for each subpage
        // they will load automatically
        // set scan inner after initially checking gh, piece by piece according to the 4 endpoints

        try {
            while (true) {
                const resp = await axios.get(`${url}/acr/all/${repo}`)
                const data = resp.data
                if ('error' in data) {
                    if (data.error === 'exceeded') {
                        setErr('GitHub API Error. Please refresh the page and search for another repository.')
                        return
                    } else {
                        setErr(data.state)
                    }
                } else {
                    setPending(false)
                    setHasRepo(true)
                    setSha(data.sha.slice(0, 8))
                    setRepo(repo)
                    setErr('Please wait.')
                    navigate('/smells')

                    const fileList = []
                    for (let i = 0; i < data.files.length; i++) {
                        fileList.push({
                            content: data.files[i].content,
                            ...data.acr.acr[i],
                        })
                    }
                    setScan(fileList)
                    return
                }

                await new Promise(r => setTimeout(r, 1000))
            }
        } catch (e) {
            console.log('GitHub API server error: ' + e)
            setErr('GitHub API Error. Please refresh the page and search for another repository.')
            setPending(false)
        }
    }

    const scanRepo = repo => {
        setPending(true)
        setHasRepo(false)
        scannerDaemon(repo)
    }

    const value = {
        isScanInner,
        hasRepo,
        scan,
        sha,
        repo,
        scanRepo,
    }

    if (isPending)
        return (
            <div
                style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                }}>
                <Spinner size="large" />
                <h2 style={{ margin: '32px 0px 0px 0px' }}>Scanning in progress</h2>
                <p style={{ margin: '6px' }}>{err}</p>
            </div>
        )

    return <RepoContext.Provider value={value}>{!isPending && children}</RepoContext.Provider>
}

export default RepoProvider
