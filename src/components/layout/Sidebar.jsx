"use client"

import { useEffect, useContext, createContext, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
    MoreVertical, ChevronLast, ChevronFirst,
    Home, Users, FileText, Calendar, Settings, History, User, LogOut
} from "lucide-react"

const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Patients", href: "/patients" },
    // { icon: FileText, label: "Meal Plans", href: "/meal-plans" },
    { icon: Calendar, label: "Appointments", href: "/appointments" },
    { icon: Settings, label: "Schedule", href: "/schedule" },
    // { icon: History, label: "History", href: "/history" },
    { icon: User, label: "Profile", href: "/profile" },
]

const SidebarContext = createContext()

export default function Sidebar() {
    const [nutritionist, setNutritionist] = useState(null)
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    useEffect(() => {
        // Fetch nutritionist data
        const loadNutritionistData = async () => {
            try {
                const response = await fetch("/api/nutritionist/me")
                if (response.ok) {
                    const data = await response.json()
                    setNutritionist(data.nutritionist)
                } else {
                    // If can't fetch data, set default
                    setNutritionist({ name: "Doctor" })
                }
            } catch (error) {
                console.error("Error loading nutritionist data:", error)
                setNutritionist({ name: "Doctor" })
            } finally {
                setLoading(false)
            }
        }

        loadNutritionistData()
    }, [])

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            const response = await fetch("/api/auth/logout", { method: "POST" })
            if (response.ok) {
                router.push("/")
            } else {
                console.error("Logout failed")
            }
        } catch (error) {
            console.error("Logout error:", error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <aside
            className={`
                z-50 transition-all duration-300
                ${expanded ? "absolute inset-0 bg-black bg-opacity-40 lg:static lg:bg-transparent" : "lg:static"}
            `}
        >

             <nav className="h-full flex flex-col bg-[#dfffd1] border-r border-green-200 shadow-sm">
                <div className="p-4 pb-2 mb-3 flex justify-between items-center border-b border-green-200">
                    <img src="/logo1.png" alt="FB"
                        className={`overflow-hidden transition-all rounded-full border-2 border-white ${expanded ? "w-12 " : "w-0" }`}
                    />
                    {expanded && <h1 className="text-xl font-bold text-gray-700">FitBalance</h1>}
                    <button onClick={() => setExpanded(curr => !curr)} className="p-1.5 rounded-lg bg-green-600/10 hover:bg-green-200">
                        {expanded
                            ? <ChevronFirst className="w-5 h-5 text-gray-500 hover:text-green-700" />
                            : <ChevronLast className="w-5 h-5 text-gray-500 hover:text-green-700" />
                        }
                    </button>
                </div>

                <SidebarContext.Provider value={{ expanded }}>
                    <ul className="flex-1 px-3">
                        {menuItems.map(({ icon: Icon, label, href }) => (
                            <SidebarItem
                                key={label}
                                icon={<Icon size={20} />}
                                text={label}
                                active={pathname === href}
                                onClick={() => router.push(href)}
                            />
                        ))}
                        <SidebarItem
                            icon={<LogOut size={20} />}
                            text={isLoggingOut ? "Logging out..." : "Logout"}
                            onClick={handleLogout}
                        />
                    </ul>
                </SidebarContext.Provider>

                <div className="border-t border-green-200 flex p-3">
                    <img
                        src="/user.png"
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full border border-green-600"
                    />
                    <div className={`flex justify-between items-center overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
                        <div className="leading-4">
                            <h4 className="font-semibold">{nutritionist?.name || "Doctor"}</h4>
                            <span className="text-xs text-gray-600">{nutritionist?.email || ""}</span>
                        </div>
                    </div>
                </div>
            </nav>
        </aside>
    )
}

function SidebarItem({ icon, text, active, alert, onClick }) {
    const { expanded } = useContext(SidebarContext)

    return (
        <li
            onClick={onClick}
            className={`
                relative flex items-center py-2 px-3 my-1 
                font-medium rounded-md cursor-pointer
                transition-colors group
                ${active
                    ? "bg-gradient-to-br from-green-300/80 to-teal-400/66 text-green-800"
                    : "text-gray-600 hover:bg-gray-100"}
            `}
        >
            {icon}
            <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
                {text}
            </span>

            {alert && (
                <div className={`absolute right-2 w-2 h-2 rounded bg-green-300 ${expanded ? "" : "top-2"}`} />
            )}

            {!expanded && (
                <div
                    className={`
                        absolute left-full rounded-md px-2 py-1 ml-6  
                        bg-green-100 text-green-800 text-sm    
                        invisible opacity-0 -translate-x-3 transition-all
                        group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
                    `}
                >
                    {text}
                </div>
            )}
        </li>
    )
}
