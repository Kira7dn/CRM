"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import brandConfig from "@/config/brand.json";
import { Tabs, TabsList, TabsTrigger } from "@shared/ui/tabs";
import { Menu, X } from "lucide-react";

const navTabs = [
    { id: "value-props", label: "Giá trị" },
    { id: "products", label: "Sản phẩm" },
    // { id: "traceability", label: "Truy xuất" },
    { id: "coto-story", label: "Cô Tô" },
    { id: "sustainability", label: "Bền vững" },
    // { id: "testimonials", label: "Đánh giá" },
    { id: "csr", label: "CSR" },
    { id: "contact", label: "Liên hệ" },
];

export default function Header() {
    const [activeTab, setActiveTab] = useState("");
    const [manualActive, setManualActive] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
        setManualActive(true);
        setTimeout(() => setManualActive(false), 1000); // Reset sau 1s

        const element = document.getElementById(tabId);
        if (element) {
            // Use getBoundingClientRect for accurate positioning
            const rect = element.getBoundingClientRect();
            const absoluteTop = window.scrollY + rect.top;

            // Calculate header height dynamically
            const header = document.querySelector('header');
            const headerHeight = header ? header.offsetHeight : 64;

            // Different offset for mobile vs desktop
            const isMobile = window.innerWidth < 768;
            const extraPadding = isMobile ? 10 : 20; // Less padding on mobile

            const targetPosition = absoluteTop - headerHeight - extraPadding;

            // Prevent scrolling to negative positions
            const finalPosition = Math.max(0, targetPosition);

            window.scrollTo({
                top: finalPosition,
                behavior: 'smooth'
            });

            // Close mobile menu after navigation
            setIsMobileMenuOpen(false);
        }
    };

    useEffect(() => {
        // Skip intersection observer on mobile for better performance
        if (window.innerWidth < 768) return;

        const observer = new IntersectionObserver(
            (entries) => {
                let maxVisible = 0;
                let activeId = "";

                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > maxVisible) {
                        maxVisible = entry.intersectionRatio;
                        activeId = entry.target.id;
                    }
                });

                // Nếu không có section nào visible nhiều, kiểm tra scroll position
                if ((!activeId || maxVisible < 0.05) && !manualActive) {
                    const scrollY = window.scrollY + window.innerHeight / 2;
                    const sections = navTabs.map(tab => ({
                        id: tab.id,
                        top: document.getElementById(tab.id)?.offsetTop || 0
                    })).sort((a, b) => a.top - b.top);

                    for (let i = sections.length - 1; i >= 0; i--) {
                        if (scrollY >= sections[i].top) {
                            activeId = sections[i].id;
                            break;
                        }
                    }
                }

                if (activeId && !manualActive) setActiveTab(activeId);
            },
            {
                threshold: 0.1,
                rootMargin: "-80px 0px -20% 0px"
            }
        );

        navTabs.forEach((tab) => {
            const element = document.getElementById(tab.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [manualActive]);

    // Close mobile menu when resizing to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) { // lg breakpoint
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="flex h-16 shrink-0 items-center justify-between">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <Image
                            src="/logo-short.svg"
                            alt={brandConfig.brand.shortName}
                            width={40}
                            height={40}
                            className="relative z-10 object-contain shrink-0"
                        />
                        <div className="flex flex-col items-start text-left h-full">
                            <span
                                className="text-brand-golden text-2xl lg:text-3xl font-bold"
                                style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}
                            >
                                {brandConfig.brand.shortName.toUpperCase()}
                            </span>
                        </div>
                    </button>

                    <div className="flex items-center gap-2">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-700" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700" />
                            )}
                        </button>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-8">
                            <Tabs value={activeTab} className="w-auto">
                                <TabsList className="bg-transparent h-auto p-0 gap-2">
                                    {navTabs.map((tab) => (
                                        <TabsTrigger
                                            key={tab.id}
                                            value={tab.id}
                                            className={`${tab.id === 'contact'
                                                ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400 shadow-md hover:shadow-lg'
                                                : 'data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 hover:bg-blue-50 text-gray-700'
                                                } px-4 py-2 rounded-full transition-colors border-0 cursor-pointer`}
                                            onClick={() => handleTabClick(tab.id)}
                                        >
                                            {tab.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
                    <div className="container mx-auto px-8 md:px-12 py-4">
                        <div className="flex flex-col space-y-2">
                            {navTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className={`text-left px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-800 font-medium'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 text-blue-600 text-xs font-medium bg-blue-50 rounded">#HảiSảnTươi</span>
                                <span className="px-2 py-1 text-green-600 text-xs font-medium bg-green-50 rounded">#AnToàn</span>
                                <span className="px-2 py-1 text-cyan-600 text-xs font-medium bg-cyan-50 rounded">#BềnVững</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
