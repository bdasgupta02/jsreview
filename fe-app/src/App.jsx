import React from 'react'
import Search from './pages/Search'
import { AtlaskitThemeProvider } from '@atlaskit/theme'
import { BrowserRouter as Router, Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom'
import { AtlassianNavigation, PrimaryButton } from '@atlaskit/atlassian-navigation'
import { PageLayout, Content, TopNavigation } from '@atlaskit/page-layout'
import { B50, N50, B500, N0, B400 } from '@atlaskit/theme/colors'
import EmptyState from '@atlaskit/empty-state'
import Button from '@atlaskit/button'
import constants from './constants/constants'
import RepoProvider from './contexts/RepoProvider'
import PrivateRoute from './components/PrivateRoute'

// if a repo isn't loaded in context -> redirect

const Incomplete = () => (
    <EmptyState
        header="This page is currently being built"
        description="Please check again at a later time."
    />
)

const NavTitle = () => {
    return (
        <h3
            style={{
                margin: '0px 8px 4px 20px',
                height: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            }}>
            <span
                style={{
                    margin: '2px 12px 0px 0px',
                    backgroundColor: B50,
                    padding: '6px 6px 8px 6px',
                    fontSize: '14px',
                    borderRadius: '5px',
                    color: B500,
                    opacity: 0.7,
                }}>
                {constants.name}
            </span>
            <span style={{ fontSize: '16px', fontWeight: 'normal' }}>bdasgupta02/</span>luminus2
            <span style={{ marginLeft: '20px', color: N50, fontWeight: 'normal', fontSize: '20px' }}>|</span>
        </h3>
    )
}

const RescanButton = () => {
    const navigate = useNavigate()
    return (
        <div
            style={{
                width: 'fit-content',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <Button onClick={() => navigate('/')}>Scan another repo</Button>
        </div>
    )
}

const NavBar = () => {
    const { pathname } = useLocation()

    const routeInfoA = [
        {
            name: 'Overview',
            route: '/overview',
        },
        {
            name: 'Smells',
            route: '/smells',
        },
        {
            name: 'Bugs',
            route: '/bugs',
        },
        {
            name: 'Maintainability',
            route: '/maintainability',
        },
        {
            name: 'Vulnerabilities',
            route: '/vulnerabilities',
        },
        {
            name: 'Repository',
            route: '/repo',
        },
    ]

    return (
        <AtlassianNavigation
            label="site"
            primaryItems={[
                routeInfoA.map(e => (
                    <Link key={e.route} to={e.route} style={{ textDecoration: 'none' }}>
                        <PrimaryButton
                            style={{
                                color: pathname && pathname === e.route ? N0 : null,
                                backgroundColor: pathname && pathname === e.route ? B400 : null,
                            }}>
                            {e.name}
                        </PrimaryButton>
                    </Link>
                )),
            ]}
            renderProductHome={NavTitle}
            renderCreate={RescanButton}
        />
    )
}

const InnerRouter = () => {
    const { pathname } = useLocation()
    return (
        <PageLayout>
            {pathname && pathname !== '/' && (
                <TopNavigation>
                    <NavBar />
                </TopNavigation>
            )}
            <Content>
                <Routes>
                    <Route
                        path="/repo"
                        element={
                            <PrivateRoute>
                                <Incomplete />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/pulls"
                        element={
                            <PrivateRoute>
                                <Incomplete />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/files"
                        element={
                            <PrivateRoute>
                                <Incomplete />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/vulnerabilities"
                        element={
                            <PrivateRoute>
                                <Incomplete />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/maintainability"
                        element={
                            <PrivateRoute>
                                <Incomplete />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/smells"
                        element={
                            <PrivateRoute>
                                <Incomplete />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/bugs"
                        element={
                            <PrivateRoute>
                                <Incomplete />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/overview"
                        element={
                            <PrivateRoute>
                                <Incomplete />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<Search />} />
                </Routes>
            </Content>
        </PageLayout>
    )
}

const App = () => {
    // for v2

    // const getLocalTheme = () => {
    //     if (!localStorage.getItem('theme')) {
    //         localStorage.setItem('light')
    //         return 'light'
    //     } else {
    //         return localStorage.getItem('theme')
    //     }
    // }

    // const [theme, setTheme] = useState(getLocalTheme())

    // const toggleTheme = () => {
    //     const oldTheme = theme
    //     const newTheme = oldTheme === 'light' ? 'dark' : 'light'

    //     localStorage.setItem('theme', newTheme)
    //     setTheme(newTheme)
    // }

    return (
        <AtlaskitThemeProvider mode={'light'}>
            <RepoProvider>
                <Router>
                    <InnerRouter />
                </Router>
            </RepoProvider>
        </AtlaskitThemeProvider>
    )
}

export default App
