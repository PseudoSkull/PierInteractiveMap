// ./App.jsx

import MainCode from './MainCode';

import { Auth } from '@supabase/auth-ui-react';
import {
  // Import predefined theme
  ThemeSupa,
} from '@supabase/auth-ui-shared'
import { createClient } from '@supabase/supabase-js';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';

const supabaseUrl = import.meta.env.VITE_REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_REACT_APP_ANON_KEY;
const appBackendHost = import.meta.env.VITE_PIER_BACKEND_HOST;
const appBackendPort = import.meta.env.VITE_PIER_BACKEND_PORT;

const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      Cookies.set('supabase-session', JSON.stringify(session), { expires: 7 });
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      Cookies.set('supabase-session', JSON.stringify(session), { expires: 7 });
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return (
        <>
            <h1>You need to sign in!</h1>
            <style>
                {`
                /* Make the "Sign Up" link invisible */
                a[href="#auth-sign-up"] {
                    display: none;
                }
                `}
            </style>
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={[]} view="sign_in" />
        </>
    )
  };

  return (
    <div>
      <p>Signed in as {session.user.email}</p>
      <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
      <br />
      <MainCode
        session={session}
        supabase={supabase}
        appBackendHost={appBackendHost}
        appBackendPort={appBackendPort}
      />
    </div>
  )
}

export default App;
