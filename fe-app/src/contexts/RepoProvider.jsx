import React, { useState, useContext, createContext } from 'react'
import Spinner from '@atlaskit/spinner'

// v2: add local storage?
// make scanning eventually modular once details are in

export const RepoContext = createContext()

export const useRepo = () => {
    return useContext(RepoContext)
}

const RepoProvider = ({ children }) => {
    const [isPending, setPending] = useState(false)

    const [hasRepo, setHasRepo] = useState(false)
    const [isScanInner, setScanInner] = useState({
        bugs: false,
        smells: false,
        main: false,
        vuln: false,
    })
    const [repo, setRepo] = useState({})
    const [scan, setScan] = useState({})

    const scannerDaemon = async () => {
        // v2: 
        // set has repo true after searching github for files
        // then set another useState true for "searching inner" to indicate search for each subpage
        // they will load automatically
        // set scan inner after initially checking gh, piece by piece according to the 4 endpoints


        // if repo doesn't exist, return
        return

        setHasRepo(true)
        setRepo({
            /* Details */
        })
        setScan({
            /* Details */
        })
        setPending(false)
    }

    const scanRepo = repo => {
        setPending(true)
        setHasRepo(false)
        setRepo({})
        scannerDaemon()
    }

    const value = {
        isScanInner,
        hasRepo,
        repo,
        scan,
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
                <p style={{ margin: '6px' }}>Please wait.</p>
            </div>
        )

    return <RepoContext.Provider value={value}>{!isPending && children}</RepoContext.Provider>
}

export default RepoProvider
