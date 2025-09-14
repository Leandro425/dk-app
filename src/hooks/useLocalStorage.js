import { useState, useEffect } from 'react'

const useLocalStorage = (key, initialValue) => {
    const getStoredValue = () => {
        try {
            const item = window.localStorage.getItem(key)
            return item !== null ? JSON.parse(item) : initialValue
        } catch {
            return initialValue
        }
    }
    const [value, setValue] = useState(getStoredValue)

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value))
        } catch {
            // Ignore write errors
        }
    }, [key, value])

    return [value, setValue]
}

export default useLocalStorage
