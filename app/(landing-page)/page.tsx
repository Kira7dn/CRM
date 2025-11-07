import Image from "next/image";
import brandConfig from "@/config/brand.json";
import Header from "./components/Header";
import HeroCarousel from "./components/HeroCarousel";

export default function Home() {

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700">
        {/* Animated SVG bubbles */}
        <svg className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            <radialGradient id="bubbleFill" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="35%" stopColor="rgba(6,182,212,0.35)" />
              <stop offset="100%" stopColor="rgba(6,182,212,0.05)" />
            </radialGradient>
            <radialGradient id="bubbleFillSmall" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
              <stop offset="40%" stopColor="rgba(8,145,178,0.35)" />
              <stop offset="100%" stopColor="rgba(8,145,178,0.05)" />
            </radialGradient>
            <filter id="blurFar">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
            <filter id="blurMid">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
            </filter>
            <filter id="blurNear">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" />
            </filter>
          </defs>
          <g className="bubbles-large" stroke="#06b6d4" strokeWidth="3" strokeOpacity="0.6" fill="url(#bubbleFill)" filter="url(#blurMid)">
            <g transform="translate(10 940)">
              <circle cx="26" cy="26" r="26" />
            </g>
            <g transform="translate(373 1071)">
              <circle cx="26" cy="26" r="26" />
            </g>
            <g transform="translate(493 1055)">
              <circle cx="26" cy="26" r="26" />
            </g>
            <g transform="translate(970 985)">
              <circle cx="26" cy="26" r="26" />
            </g>
            <g transform="translate(492 1084)">
              <circle cx="26" cy="26" r="26" />
            </g>
          </g>
          <g className="bubbles-small" stroke="#0891b2" strokeWidth="1.5" strokeOpacity="0.5" fill="url(#bubbleFillSmall)" filter="url(#blurFar)">
            <g transform="translate(147 984)">
              <circle cx="10" cy="10" r="10" />
            </g>
            <g transform="translate(526 802)">
              <circle cx="10" cy="10" r="10" />
            </g>
            <g transform="translate(606 944)">
              <circle cx="10" cy="10" r="10" />
            </g>
            <g transform="translate(727 851)">
              <circle cx="10" cy="10" r="10" />
            </g>
            <g transform="translate(753 1014)">
              <circle cx="10" cy="10" r="10" />
            </g>
            <g transform="translate(947 1020)">
              <circle cx="10" cy="10" r="10" />
            </g>
            <g transform="translate(992 950)">
              <circle cx="10" cy="10" r="10" />
            </g>
            <g transform="translate(1095 831)">
              <circle cx="10" cy="10" r="10" />
            </g>
            <g transform="translate(1204 986)">
              <circle cx="10" cy="10" r="10" />
            </g>
            <g transform="translate(1385 940)">
              <circle cx="10" cy="10" r="10" />
            </g>
          </g>
        </svg>

        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-[520px] h-[520px] bg-yellow-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-8 relative z-10">
          <div className="grid grid-cols-10 gap-8 items-center">
            <div className="col-span-4 animate-fade-in-up text-center pr-6">
              <div className="mb-5" style={{ animationDelay: '0.5s' }}>
                <span className="text-lg md:text-xl text-blue-100 font-medium">{brandConfig.brand.tagline}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6 flex flex-col items-center text-center animate-fade-in-up"
                style={{ perspective: '500px', animationDelay: '1s' }}
              >
                <span
                  className="text-white drop-shadow-lg animate-float"
                  style={{
                    transform: 'rotateX(20deg) translateZ(30px)',
                    transformStyle: 'preserve-3d',
                    animationDelay: '1.2s',
                  }}
                >
                  {brandConfig.hero.title.line1}
                </span>
                <span
                  className="animate-pulse"
                  style={{
                    background: 'linear-gradient(45deg, #fbbf24, #ffffff, #fbbf24)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradientShift 4s ease-in-out infinite, glowPulse 3s ease-in-out infinite alternate',
                    textShadow: '0 0 15px rgba(251,191,36,0.2)',
                    transform: 'scale(1.2) translateZ(30px)',
                    animationDelay: '1.5s',
                  }}
                >
                  {brandConfig.hero.title.line2}
                </span>
                <span
                  className="text-cyan-300 drop-shadow-lg animate-float"
                  style={{
                    transform: 'rotateX(-20deg) translateZ(30px)',
                    transformStyle: 'preserve-3d',
                    textShadow: '0 0 15px rgba(6,182,212,0.6)',
                    animationDelay: '1.8s',
                  }}
                >
                  {brandConfig.hero.title.line3}
                </span>
              </h1>
              <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '2s' }}>
                {brandConfig.brand.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '2.2s' }}>
                <a href={brandConfig.hero.cta.primary.link} className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all transform hover:scale-105 text-center shadow-lg" style={{ animationDelay: '2.5s' }}>
                  {brandConfig.hero.cta.primary.text}
                </a>
                <a href={brandConfig.hero.cta.secondary.link} className="bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all text-center ring-1 ring-white/20" style={{ animationDelay: '2.7s' }}>
                  {brandConfig.hero.cta.secondary.text}
                </a>
              </div>
            </div>

            <div className="col-span-6">
              <HeroCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-8 md:px-12 lg:px-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-800">
                Về <span className="text-blue-600">Hải sản Ngày mới Cô Tô</span>
              </h2>
              <p className="text-gray-600 mb-4 text-lg">
                Chúng tôi tự hào là đơn vị cung cấp hải sản uy tín tại khu vực Đông Bắc Bộ,
                mang đến cho khách hàng những sản phẩm hải sản tươi ngon nhất từ vùng biển Cô Tô.
              </p>
              <p className="text-gray-600 mb-6 text-lg">
                Với hệ thống kho lạnh hiện đại, quy trình bảo quản nghiêm ngặt và đội ngũ
                chuyên nghiệp, chúng tôi cam kết:
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Hải sản tươi ngon, nguồn gốc rõ ràng</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Bảo quản đạt chuẩn, an toàn vệ sinh thực phẩm</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Giá cả hợp lý, nhiều ưu đãi hấp dẫn</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Phục vụ tận tâm, giao hàng nhanh chóng</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <Image
                  src="/logo-full.png"
                  alt="Logo Hải sản Ngày mới Cô Tô"
                  width={300}
                  height={200}
                  className="object-contain mb-6 mx-auto"
                />
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800">10+ Năm Kinh Nghiệm</h3>
                    <p className="text-gray-600">Trong ngành hải sản tươi sống</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">500+</div>
                      <p className="text-sm text-gray-600">Khách hàng hài lòng</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">50+</div>
                      <p className="text-sm text-gray-600">Loại hải sản đa dạng</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section id="sustainability" className="py-20 bg-white">
        <div className="container mx-auto px-8 md:px-12 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Cam kết phát triển bền vững</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Chúng tôi ưu tiên các phương pháp khai thác thân thiện môi trường và hợp tác với ngư dân địa phương để bảo vệ nguồn lợi biển.
                Mỗi quyết định kinh doanh đều hướng tới sự bền vững lâu dài.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="text-5xl mb-6">🌊</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Theo dõi sản lượng khai thác</h3>
                <p className="text-gray-600 mb-4">
                  Giám sát định kỳ sản lượng khai thác, đảm bảo không vượt quá ngưỡng cho phép của các cơ quan quản lý.
                  Dữ liệu thu thập giúp hoạch định chiến lược bảo vệ nguồn tài nguyên.
                </p>
                <div className="text-2xl font-bold text-green-600">100% Tuân thủ</div>
              </div>

              <div className="text-center">
                <div className="text-5xl mb-6">⚡</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Quy trình bảo quản tiết kiệm năng lượng</h3>
                <p className="text-gray-600 mb-4">
                  Áp dụng công nghệ lạnh hiện đại, sử dụng năng lượng tái tạo và tối ưu hóa quy trình
                  để giảm thiểu tác động môi trường trong khâu bảo quản.
                </p>
                <div className="text-2xl font-bold text-green-600">30% Tiết kiệm</div>
              </div>

              <div className="text-center">
                <div className="text-5xl mb-6">🎣</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Ngư cụ thân thiện môi trường</h3>
                <p className="text-gray-600 mb-4">
                  Hỗ trợ ngư dân chuyển đổi sang ngư cụ hiện đại, ít tác động đến hệ sinh thái biển.
                  Chương trình đào tạo và hỗ trợ tài chính cho cộng đồng.
                </p>
                <div className="text-2xl font-bold text-green-600">200+ Ngư dân</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-xl p-8 md:p-12 mb-16">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Công nghệ xanh trong ngành hải sản</h3>
                  <p className="text-gray-600 mb-6">
                    Chúng tôi đầu tư vào các giải pháp công nghệ tiên tiến để giảm thiểu tác động môi trường
                    trong toàn bộ chuỗi cung ứng từ khai thác đến phân phối.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">Hệ thống lạnh thông minh tiết kiệm 40% điện năng</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">Bao bì sinh học phân hủy 100%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                      <span className="text-gray-700">Theo dõi carbon footprint toàn chuỗi</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-full w-48 h-48 mx-auto flex items-center justify-center mb-6">
                    <div className="text-6xl">♻️</div>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Bền vững là cam kết</h4>
                  <p className="text-gray-600">Không thỏa hiệp với môi trường</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-4 bg-white rounded-full shadow-lg px-8 py-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">98%</div>
                  <div className="text-sm text-gray-600">Hài lòng khách hàng</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">50%</div>
                  <div className="text-sm text-gray-600">Giảm phát thải CO2</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600">100%</div>
                  <div className="text-sm text-gray-600">Nguồn gốc có truy xuất</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CSR Section */}
      <section id="csr" className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-8 md:px-12 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Trách nhiệm cộng đồng</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Hải sản Ngày mới luôn đồng hành cùng cộng đồng địa phương qua các chương trình giáo dục, an sinh và bảo vệ môi trường biển.
                Chúng tôi cam kết phát triển bền vững và đóng góp tích cực cho xã hội.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="text-5xl mb-6">📚</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Học bổng cho con ngư dân</h3>
                <p className="text-gray-600 mb-4">
                  Hỗ trợ học phí và dụng cụ học tập cho con em ngư dân có hoàn cảnh khó khăn,
                  tạo cơ hội tiếp cận giáo dục chất lượng.
                </p>
                <div className="text-2xl font-bold text-blue-600">50+ Học sinh</div>
              </div>

              <div className="text-center">
                <div className="text-5xl mb-6">🧹</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Chiến dịch làm sạch bãi biển</h3>
                <p className="text-gray-600 mb-4">
                  Tổ chức định kỳ các chiến dịch thu gom rác thải, nâng cao ý thức bảo vệ môi trường biển
                  cùng cộng đồng địa phương.
                </p>
                <div className="text-2xl font-bold text-blue-600">20+ Sự kiện</div>
              </div>

              <div className="text-center">
                <div className="text-5xl mb-6">🐠</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Bảo tồn hệ sinh thái biển</h3>
                <p className="text-gray-600 mb-4">
                  Hợp tác với các tổ chức bảo tồn, tham gia nghiên cứu và bảo vệ đa dạng sinh học biển,
                  phát triển du lịch sinh thái bền vững.
                </p>
                <div className="text-2xl font-bold text-blue-600">5+ Dự án</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Tầm nhìn phát triển bền vững</h3>
                  <p className="text-gray-600 mb-6">
                    Chúng tôi không chỉ kinh doanh hải sản mà còn cam kết bảo vệ nguồn tài nguyên biển
                    cho thế hệ mai sau. Mỗi sản phẩm bán ra là đóng góp cho cộng đồng và môi trường.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-gray-700">Khai thác bền vững, không quá độ</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-gray-700">Hỗ trợ cộng đồng ngư dân địa phương</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-gray-700">Bảo vệ môi trường biển và đa dạng sinh học</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-gray-700">Đầu tư vào giáo dục và phát triển cộng đồng</span>
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-full w-48 h-48 mx-auto flex items-center justify-center mb-6">
                    <div className="text-6xl">🌊</div>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Hải sản Ngày mới</h4>
                  <p className="text-gray-600">Phát triển bền vững từ biển cả</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-8 md:px-12 lg:px-16">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
            {brandConfig.products.title.split('Sản phẩm')[0]}
            <span className="text-blue-600">Sản phẩm</span>
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            {brandConfig.products.subtitle}
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {brandConfig.products.categories.map((category) => {
              const gradientMap: Record<string, string> = {
                "blue": "from-blue-400 to-blue-600",
                "cyan": "from-cyan-400 to-cyan-600",
                "green": "from-green-400 to-green-600"
              };

              const textColorMap: Record<string, string> = {
                "blue": "text-blue-100",
                "cyan": "text-cyan-100",
                "green": "text-green-100"
              };

              return (
                <div key={category.id} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all">
                  <div className={`aspect-square bg-gradient-to-br ${gradientMap[category.color]} flex items-center justify-center`}>
                    <div className="text-center text-white p-8">
                      <div className="text-6xl mb-4">{category.emoji}</div>
                      <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                      <p className={textColorMap[category.color]}>{category.description}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <a href={category.link} className="w-full bg-yellow-500 text-gray-900 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors text-center">
                      Xem chi tiết
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-8 md:px-12 lg:px-16 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Sẵn sàng thưởng thức hải sản tươi ngon?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Liên hệ ngay với chúng tôi để được tư vấn và đặt hàng các sản phẩm hải sản chất lượng cao
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Nhắn tin Facebook
            </a>
            <a href="https://zalo.me" target="_blank" rel="noopener noreferrer"
              className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
              Chat Zalo
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-white">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <div className="text-3xl mb-3">📞</div>
              <h3 className="font-bold mb-2">Hotline</h3>
              <p className="text-blue-100">0123 456 789</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="font-bold mb-2">Email</h3>
              <p className="text-blue-100">contact@haisanngaymoi.vn</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <div className="text-3xl mb-3">📍</div>
              <h3 className="font-bold mb-2">Khu vực</h3>
              <p className="text-blue-100">Đông Bắc Bộ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hashtag Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700">
        <div className="container mx-auto px-8 md:px-12 lg:px-16 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">
            #HảiSảnNgàyMới #HảiSảnTươiNgon #BềnVữngTừBiển
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white text-sm">#HảiSảnCôTô</span>
            <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white text-sm">#NgưDânViệtNam</span>
            <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white text-sm">#BảoVệMôiTrường</span>
            <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white text-sm">#HảiSảnAnToàn</span>
            <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white text-sm">#PhátTriểnBềnVững</span>
            <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white text-sm">#TráchNhiệmCộngĐồng</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-8 md:px-12 lg:px-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Image
                src="/logo-full.png"
                alt="Hải sản Ngày mới Cô Tô"
                width={80}
                height={80}
                className="mb-4"
              />
              <p className="text-sm">
                Hải sản tươi ngon, an toàn cho mọi gia đình Việt
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Hải sản tươi sống</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Hải sản đông lạnh</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Sản phẩm chế biến</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Thông tin</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-yellow-400 transition-colors">Về chúng tôi</a></li>
                <li><a href="#benefits" className="hover:text-yellow-400 transition-colors">Ưu điểm</a></li>
                <li><a href="#contact" className="hover:text-yellow-400 transition-colors">Liên hệ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-sm">
                <li>📞 0123 456 789</li>
                <li>📧 contact@haisanngaymoi.vn</li>
                <li>📍 Đông Bắc Bộ, Việt Nam</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 Hải sản Ngày mới Cô Tô. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
