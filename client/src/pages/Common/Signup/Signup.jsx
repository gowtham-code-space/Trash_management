import React from 'react'
import ThemeStore from '../../../store/ThemeStore';
export default function Signup() {
    const {isDarkTheme , toggleTheme} = ThemeStore();
    return (
        <div className={isDarkTheme ? "dark" : ""}>
            <div className="min-h-screen bg-background text-secondaryDark p-6 space-y-4">
                <h1 className="text-2xl font-bold">Zustand testing</h1>
                <button onClick={toggleTheme} className="px-4 py-2 rounded-medium bg-primary text-white">
                    press me
                </button>
                <h1 className="text-xl font-semibold">{isDarkTheme ? "dark": "light"}</h1>
            </div>
        </div>
    )
}
