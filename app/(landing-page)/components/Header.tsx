"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import brandConfig from "@/config/brand.json";
import { Tabs, TabsList, TabsTrigger } from "@shared/ui/tabs";

const navTabs = [
    { id: "about", label: "Giới thiệu" },
    { id: "sustainability", label: "Bền vững" },
    { id: "csr", label: "CSR" },
    { id: "products", label: "Sản phẩm" },
    { id: "contact", label: "Liên hệ" },
];

export default function Header() {
    const [activeTab, setActiveTab] = useState("");
    const [manualActive, setManualActive] = useState(false);

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
        setManualActive(true);
        setTimeout(() => setManualActive(false), 1000); // Reset sau 1s

        const element = document.getElementById(tabId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    useEffect(() => {
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

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <nav className="container mx-auto px-8 md:px-12 lg:px-16 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Image
                            src={brandConfig.assets.logoFull}
                            alt={brandConfig.brand.shortName}
                            width={60}
                            height={60}
                            priority
                            className="relative z-10 rounded-full shadow-lg"
                            style={{
                                boxShadow: '0 0 30px rgba(243, 174, 0, 0.95), 0 0 50px rgba(255,255,255,0.4)',
                                filter: 'drop-shadow(0 0 12px rgba(243, 174, 0, 0.8))',
                                transform: 'scale(1.05)',
                                animation: 'glowPulse 3s ease-in-out infinite alternate',
                                animationDelay: '1.5s',
                            }}
                        />
                    </div>
                    <span className="font-bold text-3xl text-blue-900">{brandConfig.brand.shortName}</span>
                    <div className="flex items-center gap-2">
                        <span className="px-1 py-1 text-blue-600 text-xs font-medium">#HảiSảnTươi</span>
                        <span className="px-1 py-1 text-green-600 text-xs font-medium">#AnToàn</span>
                        <span className="px-1 py-1 text-cyan-600 text-xs font-medium">#BềnVững</span>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-8">
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
            </nav>
        </header>
    );
}
