import { useState } from "react"
import ShowMessage from "./showMessage"
import { App } from 'antd';


export let displayMessage;
export default function MasterContainer({ children }) {
    const { message, modal, notification } = App.useApp();
    const [errorProperty, setErrorProperty] = useState({
        message: null,
        type: null,
        open: false,
    })


    displayMessage = (msg, type) => {
        
        if (type === 'error') {
            message.error(msg, 4)  // Duration 4 seconds
        } else if (type === 'success') {
            message.success(msg, 4)  // Duration 4 seconds
        }
        // setErrorProperty({ ...errorProperty, message: message, type: type, open: true })
    }
    const close = () => {
        setErrorProperty({ ...errorProperty, message: null, type: null, open: false })
    }

    return <>
        <ShowMessage
            close={close}
            open={errorProperty.open}
            message={errorProperty.message}
            type={errorProperty.type}
        />
        {children}
    </>
}