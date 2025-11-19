import { Container } from "@/app/(landing-page)/_components/Container";
import { SectionHeading } from "@/app/(landing-page)/_components/SectionHeading";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách Cookies | Ngày Mới Cô Tô",
  description: "Chính sách sử dụng Cookies của Ngày Mới Cô Tô - Hải sản tươi sống từ Cô Tô",
};

export default function CookiesPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 py-6">
        <Container>
          <Link href="/" className="text-brand-crystal hover:text-brand-crystal/80 font-semibold">
            ← Quay lại trang chủ
          </Link>
        </Container>
      </header>

      {/* Main Content */}
      <main className="py-12 md:py-20">
        <Container size="text">
          <SectionHeading level="h1" color="default" className="mb-8">
            Chính sách Cookies
          </SectionHeading>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <p className="text-sm text-gray-500">
              Cập nhật lần cuối: Tháng 11, 2025
            </p>

            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                1. Cookies là gì?
              </h2>
              <p>
                Cookies là các tệp văn bản nhỏ được lưu trữ trên thiết bị của bạn (máy tính, điện thoại,
                máy tính bảng) khi bạn truy cập website. Cookies giúp website "nhớ" thông tin về lượt
                truy cập của bạn, chẳng hạn như ngôn ngữ ưa thích, giỏ hàng, hoặc thông tin đăng nhập,
                giúp trải nghiệm của bạn thuận tiện và cá nhân hóa hơn.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                2. Chúng tôi sử dụng Cookies như thế nào?
              </h2>
              <p className="mb-4">
                Ngày Mới Cô Tô sử dụng cookies để cải thiện dịch vụ và trải nghiệm người dùng.
                Cookies giúp chúng tôi:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ghi nhớ thông tin đăng nhập và tùy chọn của bạn</li>
                <li>Duy trì giỏ hàng trong suốt phiên duyệt</li>
                <li>Phân tích cách người dùng sử dụng website để cải thiện chất lượng</li>
                <li>Hiển thị nội dung và quảng cáo phù hợp với sở thích của bạn</li>
                <li>Theo dõi hiệu quả của các chiến dịch marketing</li>
                <li>Đảm bảo an ninh và phát hiện hành vi gian lận</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                3. Các loại Cookies chúng tôi sử dụng
              </h2>

              <h3 className="text-xl font-semibold text-brand-charcoal mb-3 mt-6">
                3.1. Cookies cần thiết (Essential Cookies)
              </h3>
              <p className="mb-3">
                Các cookies này cần thiết để website hoạt động bình thường. Không thể tắt chúng
                mà không ảnh hưởng đến chức năng cơ bản của website.
              </p>
              <div className="bg-brand-sand/30 p-4 rounded-lg mb-4">
                <p className="font-semibold mb-2">Ví dụ:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Session cookies: Duy trì trạng thái đăng nhập</li>
                  <li>Shopping cart cookies: Lưu sản phẩm trong giỏ hàng</li>
                  <li>Security cookies: Bảo mật và ngăn chặn tấn công CSRF</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-brand-charcoal mb-3 mt-6">
                3.2. Cookies chức năng (Functional Cookies)
              </h3>
              <p className="mb-3">
                Các cookies này cho phép website ghi nhớ lựa chọn của bạn để cung cấp trải nghiệm
                cá nhân hóa hơn.
              </p>
              <div className="bg-brand-sand/30 p-4 rounded-lg mb-4">
                <p className="font-semibold mb-2">Ví dụ:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Language preferences: Ngôn ngữ hiển thị (tiếng Việt/English)</li>
                  <li>Region settings: Khu vực giao hàng ưu tiên</li>
                  <li>UI preferences: Giao diện sáng/tối (nếu có)</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-brand-charcoal mb-3 mt-6">
                3.3. Cookies phân tích (Analytics Cookies)
              </h3>
              <p className="mb-3">
                Các cookies này giúp chúng tôi hiểu cách người dùng tương tác với website để cải thiện
                dịch vụ.
              </p>
              <div className="bg-brand-sand/30 p-4 rounded-lg mb-4">
                <p className="font-semibold mb-2">Ví dụ:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Google Analytics: Theo dõi lượt truy cập, hành vi người dùng</li>
                  <li>Heatmaps: Phân tích khu vực người dùng click nhiều nhất</li>
                  <li>Conversion tracking: Đo lường hiệu quả chiến dịch</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-brand-charcoal mb-3 mt-6">
                3.4. Cookies quảng cáo (Marketing/Advertising Cookies)
              </h3>
              <p className="mb-3">
                Các cookies này được sử dụng để hiển thị quảng cáo phù hợp với sở thích của bạn.
              </p>
              <div className="bg-brand-sand/30 p-4 rounded-lg mb-4">
                <p className="font-semibold mb-2">Ví dụ:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Facebook Pixel: Theo dõi chuyển đổi từ Facebook Ads</li>
                  <li>Google Ads: Remarketing và đo lường ROI</li>
                  <li>TikTok Pixel: Theo dõi hiệu quả quảng cáo trên TikTok</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                4. Cookies của bên thứ ba
              </h2>
              <p className="mb-4">
                Ngoài cookies của chúng tôi, một số bên thứ ba cũng có thể đặt cookies trên thiết bị
                của bạn khi bạn truy cập website. Các bên thứ ba này bao gồm:
              </p>

              <div className="space-y-4">
                <div className="border-l-4 border-brand-crystal pl-4">
                  <h4 className="font-semibold text-brand-charcoal mb-1">Google Analytics</h4>
                  <p className="text-sm">
                    Thu thập dữ liệu ẩn danh về hành vi người dùng để phân tích và cải thiện website.
                  </p>
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-crystal hover:underline text-sm"
                  >
                    Chính sách bảo mật Google →
                  </a>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-brand-charcoal mb-1">Facebook Pixel</h4>
                  <p className="text-sm">
                    Theo dõi chuyển đổi từ quảng cáo Facebook và tạo đối tượng remarketing.
                  </p>
                  <a
                    href="https://www.facebook.com/privacy/explanation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-crystal hover:underline text-sm"
                  >
                    Chính sách dữ liệu Facebook →
                  </a>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-brand-charcoal mb-1">Cổng thanh toán</h4>
                  <p className="text-sm">
                    VNPay, Momo, ZaloPay có thể sử dụng cookies để xử lý thanh toán an toàn.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                5. Thời gian lưu trữ Cookies
              </h2>
              <p className="mb-4">Cookies có thể được lưu trữ trong các khoảng thời gian khác nhau:</p>

              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-32 font-semibold text-brand-charcoal">
                    Session cookies
                  </div>
                  <div className="flex-1 text-gray-600">
                    Bị xóa ngay khi bạn đóng trình duyệt
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-32 font-semibold text-brand-charcoal">
                    Persistent cookies
                  </div>
                  <div className="flex-1 text-gray-600">
                    Lưu trữ từ vài ngày đến vài năm tùy loại cookie
                  </div>
                </div>
              </div>

              <p className="mt-4">
                Hầu hết cookies của chúng tôi có thời hạn 1-2 năm. Cookies phân tích thường lưu 24 tháng,
                cookies quảng cáo lưu 3-12 tháng.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                6. Cách quản lý và tắt Cookies
              </h2>
              <p className="mb-4">
                Bạn có toàn quyền kiểm soát việc chấp nhận hoặc từ chối cookies. Tuy nhiên, lưu ý rằng
                việc tắt một số cookies có thể ảnh hưởng đến chức năng của website.
              </p>

              <h3 className="text-xl font-semibold text-brand-charcoal mb-3 mt-6">
                6.1. Quản lý qua trình duyệt
              </h3>
              <p className="mb-3">Hầu hết trình duyệt cho phép bạn quản lý cookies qua cài đặt:</p>

              <div className="space-y-3 bg-gray-50 p-6 rounded-lg">
                <div>
                  <strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data
                </div>
                <div>
                  <strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data
                </div>
                <div>
                  <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
                </div>
                <div>
                  <strong>Microsoft Edge:</strong> Settings → Cookies and site permissions → Cookies
                </div>
              </div>

              <h3 className="text-xl font-semibold text-brand-charcoal mb-3 mt-6">
                6.2. Tắt cookies theo loại
              </h3>
              <p className="mb-3">
                Bạn có thể chọn tắt từng loại cookies cụ thể (ngoại trừ cookies cần thiết):
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Cookies phân tích:</strong> Sử dụng Google Analytics Opt-out Browser Add-on
                </li>
                <li>
                  <strong>Cookies quảng cáo:</strong> Truy cập{" "}
                  <a
                    href="http://www.youronlinechoices.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-crystal hover:underline"
                  >
                    Your Online Choices
                  </a>{" "}
                  để quản lý
                </li>
              </ul>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
                <p className="text-sm">
                  <strong>Lưu ý:</strong> Nếu bạn tắt tất cả cookies, bạn có thể gặp khó khăn khi đăng nhập,
                  giỏ hàng không được lưu, và một số tính năng khác không hoạt động bình thường.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                7. Do Not Track (DNT)
              </h2>
              <p>
                Một số trình duyệt hỗ trợ tính năng "Do Not Track" (DNT), yêu cầu website không theo dõi
                hoạt động người dùng. Hiện tại chưa có tiêu chuẩn chung về DNT, nhưng chúng tôi tôn trọng
                lựa chọn của người dùng và giảm thiểu việc thu thập dữ liệu không cần thiết.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                8. Cập nhật chính sách
              </h2>
              <p>
                Chúng tôi có thể cập nhật chính sách cookies này để phản ánh các thay đổi trong công nghệ,
                pháp luật, hoặc hoạt động kinh doanh. Mọi thay đổi sẽ được công bố trên trang này với
                ngày cập nhật mới.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                9. Liên hệ
              </h2>
              <p className="mb-4">
                Nếu bạn có câu hỏi về chính sách cookies hoặc cách chúng tôi xử lý dữ liệu của bạn,
                vui lòng liên hệ:
              </p>
              <div className="bg-brand-sand/50 p-6 rounded-lg">
                <p className="font-semibold mb-2">Công ty TNHH Ngày Mới Cô Tô</p>
                <p>Email: <a href="mailto:privacy@ngaymoicoto.vn" className="text-brand-crystal hover:underline">privacy@ngaymoicoto.vn</a></p>
                <p>Hotline: <a href="tel:0971155286" className="text-brand-crystal hover:underline">097 115 5286</a></p>
                <p>Địa chỉ: Đảo Cô Tô, Quảng Ninh, Việt Nam</p>
              </div>
            </section>

            {/* Additional Info Box */}
            <div className="bg-gradient-to-r from-brand-crystal/10 to-brand-golden/10 border-2 border-brand-crystal/20 rounded-xl p-6 mt-8">
              <h3 className="text-xl font-bold text-brand-charcoal mb-3">
                Cam kết của chúng tôi
              </h3>
              <p>
                Ngày Mới Cô Tô cam kết sử dụng cookies một cách minh bạch và có trách nhiệm.
                Chúng tôi không bán dữ liệu cá nhân của bạn cho bên thứ ba. Cookies chỉ được sử dụng
                để cải thiện trải nghiệm của bạn và cung cấp dịch vụ tốt hơn.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-6">
            <Link href="/privacy" className="text-brand-crystal hover:underline font-medium">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="text-brand-crystal hover:underline font-medium">
              Điều khoản sử dụng
            </Link>
            <Link href="/" className="text-brand-crystal hover:underline font-medium">
              Quay lại trang chủ
            </Link>
          </div>
        </Container>
      </main>
    </div>
  );
}
