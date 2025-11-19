"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/tabs";

const infoTabs = [
    {
        id: "about",
        label: "Giới thiệu",
        heading: "Đội ngũ của chúng tôi",
        description:
            "Đội ngũ Hải sản Ngày mới Cô Tô gồm những chuyên gia lâu năm trong lĩnh vực đánh bắt, phân phối và kiểm soát chất lượng hải sản tươi sống.",
        highlights: [
            "Quản lý kho lạnh và logistics chuyên nghiệp",
            "Đối tác chiến lược với các ngư trường Cô Tô",
            "Đội ngũ chăm sóc khách hàng tận tâm",
        ],
    },
    {
        id: "sustainability",
        label: "Bền vững",
        heading: "Cam kết phát triển bền vững",
        description:
            "Chúng tôi ưu tiên các phương pháp khai thác thân thiện môi trường và hợp tác với ngư dân địa phương để bảo vệ nguồn lợi biển.",
        highlights: [
            "Theo dõi sản lượng khai thác định kỳ",
            "Áp dụng quy trình bảo quản tiết kiệm năng lượng",
            "Hỗ trợ ngư dân chuyển đổi sang ngư cụ an toàn",
        ],
    },
    {
        id: "products",
        label: "Sản phẩm",
        heading: "Danh mục sản phẩm đa dạng",
        description:
            "Từ hải sản tươi sống đến các sản phẩm chế biến sâu, chúng tôi đáp ứng đầy đủ nhu cầu của nhà hàng và hộ gia đình.",
        highlights: [
            "Hải sản tươi sống vừa cập bến",
            "Hải sản đông lạnh đạt chuẩn HACCP",
            "Sản phẩm chế biến tiện lợi cho gia đình",
        ],
    },
    {
        id: "csr",
        label: "CSR",
        heading: "Trách nhiệm cộng đồng",
        description:
            "Hải sản Ngày mới luôn đồng hành cùng cộng đồng địa phương qua các chương trình giáo dục, an sinh và bảo vệ môi trường biển.",
        highlights: [
            "Hỗ trợ học bổng cho con em ngư dân",
            "Chiến dịch làm sạch bãi biển định kỳ",
            "Hợp tác với tổ chức bảo tồn sinh vật biển",
        ],
    },
    {
        id: "contact",
        label: "Liên hệ",
        heading: "Kết nối cùng chúng tôi",
        description:
            "Đội ngũ tư vấn sẵn sàng hỗ trợ bạn 24/7 với các kênh liên lạc đa dạng và chính sách giao hàng linh hoạt.",
        highlights: [
            "Hotline 0123 456 789",
            "Zalo & Facebook phản hồi tức thì",
            "Hệ thống giao nhận toàn khu vực Đông Bắc",
        ],
    },
];

export default function InfoTabs() {
    return (
        <section className="relative bg-white py-16 md:py-20">
            <div className="container mx-auto px-8 md:px-12 lg:px-16">
                <div className="bg-blue-900 rounded-3xl shadow-2xl overflow-hidden">
                    <Tabs defaultValue="about" className="w-full">
                        <TabsList className="grid w-full grid-cols-5 bg-white rounded-none h-auto p-0">
                            {infoTabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="flex-1 px-6 py-4 text-sm md:text-base font-semibold transition-colors data-[state=active]:bg-blue-900 data-[state=active]:text-white text-blue-900 hover:bg-blue-50 rounded-none border-0"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {infoTabs.map((tab) => (
                            <TabsContent key={tab.id} value={tab.id} className="px-6 md:px-12 lg:px-16 py-10 text-white m-0">
                                <div className="space-y-6">
                                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm uppercase tracking-wide">
                                        <span>{tab.label}</span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold">{tab.heading}</h2>
                                    <p className="text-blue-100 max-w-2xl leading-relaxed">
                                        {tab.description}
                                    </p>
                                    <ul className="grid md:grid-cols-2 gap-4 max-w-3xl">
                                        {tab.highlights.map((item) => (
                                            <li key={item} className="flex items-start gap-3">
                                                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </span>
                                                <span className="text-blue-100">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>
        </section>
    );
}
