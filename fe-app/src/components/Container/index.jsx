import React from 'react'

const Container = ({ children }) => {
    return (
        <div
            style={{
                width: '100%',
                minWidth: '700px',
                display: 'flex',
                flexDirection: 'column',
            }}>
            <div style={{ margin: '0px 30px 0px 30px' }}>{children}</div>
        </div>
    )
}

export default Container
