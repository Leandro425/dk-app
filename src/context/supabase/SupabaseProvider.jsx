import React, { useEffect, useState } from 'react'
import { Flex, Spin } from 'antd'
import { createClient } from '@supabase/supabase-js'
import { SupabaseContext } from './supabaseContext'
import { supabaseUrl, supabasePublishableKey } from './supabaseConfig'
import LoadingScreen from '../../components/LoadingScreen'

const supabase = createClient(supabaseUrl, supabasePublishableKey)

const SupabaseProvider = ({ children }) => {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get the current session
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            setLoading(false)
        })

        // Subscribe to auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setLoading(false)
        })

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe()
        }
    }, [])

    // Login with email & password
    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    }

    // Logout
    const logout = async () => {
        const { error } = await supabase.auth.signOut()
        return { error }
    }

    // Extract user for convenience
    const user = session?.user ?? null

    return (
        <SupabaseContext.Provider value={{ supabase, session, user, login, logout }}>
            {loading ? <LoadingScreen /> : children}
        </SupabaseContext.Provider>
    )
}

export default SupabaseProvider
