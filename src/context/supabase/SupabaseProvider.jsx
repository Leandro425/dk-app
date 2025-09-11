import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { SupabaseContext } from './supabaseContext'
import { supabaseUrl, supabasePublishableKey } from './supabaseConfig'

const supabase = createClient(supabaseUrl, supabasePublishableKey)

const SupabaseProvider = ({ children }) => {
    const [session, setSession] = useState(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session))
        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })
        return () => subscription.subscription.unsubscribe()
    }, [])

    const login = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error }
    }

    const logout = async () => {
        const { error } = await supabase.auth.signOut()
        return { error }
    }

    return <SupabaseContext.Provider value={{ supabase, session, login, logout }}>{children}</SupabaseContext.Provider>
}

export default SupabaseProvider
