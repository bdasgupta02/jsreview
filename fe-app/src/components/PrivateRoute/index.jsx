import { Navigate } from 'react-router-dom'
import { useRepo } from '../../contexts/RepoProvider'

const PrivateRoute = ({ children }) => {
    const { isScanInitiated, hasRepo } = useRepo()
    return !!hasRepo || isScanInitiated ? children : <Navigate to={'/'} replace />
}

export default PrivateRoute
