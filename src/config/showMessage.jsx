import React, { useEffect } from 'react';
import { Alert } from 'antd';

const ShowMessage = ({ type, message, open, close }) => {

    useEffect(() => {
        setTimeout(() => {
            // close(false);
        }, 3000);
    }, [])
    return <>
        {open && <div className='w-full flex justify-center p-5' style={{ position: 'fixed', bottom: 0, zIndex: 999 }}>
            <Alert onClose={close} message={message} type={type} showIcon closable />
        </div>}
    </>
};

export default ShowMessage;