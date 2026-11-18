import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart,
    FileText,
    ReceiptText,
    ArrowUpRight,
    LogOut,
    Settings,
    UserRound,
    ChevronDown,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// import image from '../../assets/download.png';

const tiles = [
    {
        title: 'Purchase Order',
        description: 'Manage purchase orders',
        icon: ShoppingCart,
        path: '/dashboard/po',
        color: 'bg-blue-50 text-blue-600',
    },
    {
        title: 'Sales Order',
        description: 'Manage sales orders',
        icon: FileText,
        path: '/dashboard/so',
        color: 'bg-emerald-50 text-emerald-600',
    },
    {
        title: 'Proforma Invoice',
        description: 'Manage proforma invoices',
        icon: ReceiptText,
        path: '/proforma-invoices',
        color: 'bg-violet-50 text-violet-600',
    },
];

export default function MainDashboard() {
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setProfileOpen(false);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:py-8">
            <div className="relative mx-auto max-w-5xl">

                {/* Top-right Profile */}
                

                {/* Company Details */}
                <header className="mb-3 border-b border-slate-200
                    px-2 pb-5 pt-12 text-center sm:pt-4 ">

                    {/* <div className="mb-3 flex justify-center">
                        <img
                            src={image}
                            alt="Silverline Ventura logo"
                            className="h-16 w-20 object-contain sm:h-20 sm:w-24"
                        />
                    </div> */}

                    <div
                    ref={profileRef}
                    className="absolute right-0 top-0 z-20"
                >
                    <button
                        type="button"
                        aria-expanded={profileOpen}
                        aria-haspopup="true"
                        onClick={() => setProfileOpen((prev) => !prev)}
                        className="flex items-center gap-2 rounded-full
                            border border-slate-200 bg-white px-2 py-2
                            shadow-sm transition hover:bg-slate-100"
                    >
                        <div className="flex h-8 w-8 items-center justify-center
                            rounded-full bg-blue-100 text-blue-700">
                            <UserRound size={17} />
                        </div>

                        <span className="hidden text-sm font-medium
                            text-slate-700 sm:block">
                            My Account
                        </span>

                        <ChevronDown
                            size={16}
                            className={`text-slate-500 transition-transform ${
                                profileOpen ? 'rotate-180' : ''
                            }`}
                        />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-56
                            overflow-hidden rounded-xl border
                            border-slate-200 bg-white shadow-lg">

                            <div className="border-b border-slate-100 px-4 py-3">
                                <p className="text-sm font-semibold text-slate-800">
                                    My Account
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Manage your account
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setProfileOpen(false);
                                    navigate('/profile');
                                }}
                                className="flex w-full items-center gap-3
                                    px-4 py-3 text-sm text-slate-700
                                    hover:bg-slate-50"
                            >
                                <UserRound size={17} />
                                Profile
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setProfileOpen(false);
                                    navigate('/settings');
                                }}
                                className="flex w-full items-center gap-3
                                    px-4 py-3 text-sm text-slate-700
                                    hover:bg-slate-50"
                            >
                                <Settings size={17} />
                                Settings
                            </button>

                            <div className="border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3
                                        px-4 py-3 text-sm text-red-600
                                        hover:bg-red-50"
                                >
                                    <LogOut size={17} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                    <div>
                    <h1 className="text-xl font-bold tracking-wide
                        text-slate-900 sm:text-2xl">
                        Silverline Ventura
                    </h1>

                    <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                        Office No-703, Seventh Floor, S.No 30, DNK SQUARE,
                        <br className="hidden sm:block" />
                        {' '}Airport Road, Sakore Nagar, Viman Nagar,
                        <br className="hidden sm:block" />
                        {' '}Pune, Maharashtra 411014.
                    </p>

                    <p className="mt-2 wrap-break-word text-xs leading-5 text-slate-500">
                        GSTIN: 27AAUFM1756H1ZT
                        <span className="mx-2 hidden sm:inline">|</span>
                        <br className="sm:hidden" />
                        Email: info@silverlineventura.com
                    </p> 
                    </div>
                </header>

                {/* Dashboard Title */}
                <div className="mb-4 text-center">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Dashboard
                    </h2>
                </div>

                {/* Document Tiles */}
                <div className="mx-auto grid max-w-3xl grid-cols-1
                    gap-4 sm:grid-cols-3">

                    {tiles.map((tile) => {
                        const Icon = tile.icon;

                        return (
                            <button
                                key={tile.path}
                                type="button"
                                onClick={() => navigate(tile.path)}
                                className="group rounded-xl border
                                    border-slate-200 bg-white p-4 text-left
                                    shadow-sm transition duration-200
                                    hover:-translate-y-1 hover:border-blue-300
                                    hover:shadow-md focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-blue-500"
                            >
                                <div className="mb-3 flex items-center
                                    justify-between">

                                    <div className={`flex h-10 w-10
                                        items-center justify-center
                                        rounded-lg ${tile.color}`}>
                                        <Icon size={21} />
                                    </div>

                                    <ArrowUpRight
                                        size={17}
                                        className="text-slate-400
                                            transition group-hover:text-blue-600"
                                    />
                                </div>

                                <h3 className="text-sm font-semibold
                                    text-slate-800">
                                    {tile.title}
                                </h3>

                                <p className="mt-1 text-xs leading-5
                                    text-slate-500">
                                    {tile.description}
                                </p>
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <footer className="mt-8 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} Silverline Ventura.
                    All rights reserved.
                </footer>
            </div>
        </div>
    );
}