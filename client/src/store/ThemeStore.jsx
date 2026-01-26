import {create} from "zustand";
import {persist} from "zustand/middleware"

const ThemeStore = create(persist((set) => ({
    isDarkTheme: false,
    toggleTheme: () => set((state) => ({isDarkTheme: !state.isDarkTheme}))
}), {
    name: "theme-preference"
}
))

export default ThemeStore;