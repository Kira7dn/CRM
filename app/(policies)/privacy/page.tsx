import { Container } from "@/app/(landing-page)/components/ui/Container";
import { SectionHeading } from "@/app/(landing-page)/components/ui/SectionHeading";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | Ngày Mới Cô Tô",
  description: "Chính sách bảo mật thông tin khách hàng của Ngày Mới Cô Tô - Hải sản tươi sống từ Cô Tô",
};

export default function PrivacyPolicyPage() {
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
            Chính sách bảo mật
          </SectionHeading>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <p className="text-sm text-gray-500">
              Cập nhật lần cuối: Tháng 11, 2025
            </p>

            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                1. Giới thiệu
              </h2>
              <p>
                Chào mừng bạn đến với Ngày Mới Cô Tô. Chúng tôi cam kết bảo vệ quyền riêng tư
                và thông tin cá nhân của khách hàng. Chính sách bảo mật này giải thích cách chúng
                tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin của bạn khi sử dụng dịch vụ
                của chúng tôi.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                2. Thông tin chúng tôi thu thập
              </h2>
              <p className="mb-4">Chúng tôi có thể thu thập các loại thông tin sau:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Thông tin cá nhân:</strong> Họ tên, số điện thoại, địa chỉ email,
                  địa chỉ giao hàng khi bạn đặt hàng hoặc đăng ký tài khoản.
                </li>
                <li>
                  <strong>Thông tin thanh toán:</strong> Thông tin thẻ ngân hàng, tài khoản
                  thanh toán (được mã hóa và xử lý qua cổng thanh toán bảo mật của bên thứ ba).
                </li>
                <li>
                  <strong>Thông tin đơn hàng:</strong> Lịch sử mua hàng, sản phẩm yêu thích,
                  phản hồi và đánh giá sản phẩm.
                </li>
                <li>
                  <strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, thiết bị,
                  hệ điều hành, và thông tin truy cập website thông qua cookies và công nghệ tương tự.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                3. Cách chúng tôi sử dụng thông tin
              </h2>
              <p className="mb-4">Thông tin của bạn được sử dụng để:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Xử lý và giao đơn hàng của bạn</li>
                <li>Cung cấp dịch vụ khách hàng và hỗ trợ</li>
                <li>Gửi thông báo về đơn hàng, cập nhật sản phẩm mới</li>
                <li>Cải thiện trải nghiệm người dùng và dịch vụ của chúng tôi</li>
                <li>Phân tích hành vi người dùng để tối ưu hóa website</li>
                <li>Gửi email marketing (chỉ khi bạn đồng ý nhận)</li>
                <li>Tuân thủ các nghĩa vụ pháp lý</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                4. Bảo mật thông tin
              </h2>
              <p>
                Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ
                thông tin cá nhân của bạn khỏi truy cập trái phép, mất mát, hoặc tiết lộ:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Mã hóa SSL/TLS cho tất cả dữ liệu truyền tải</li>
                <li>Lưu trữ dữ liệu trên máy chủ bảo mật với kiểm soát truy cập nghiêm ngặt</li>
                <li>Chỉ nhân viên được ủy quyền mới có quyền truy cập thông tin</li>
                <li>Kiểm tra và cập nhật biện pháp bảo mật thường xuyên</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                5. Chia sẻ thông tin với bên thứ ba
              </h2>
              <p className="mb-4">
                Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn. Chúng tôi chỉ chia
                sẻ thông tin với các bên sau khi cần thiết:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Đối tác vận chuyển:</strong> Để giao hàng đến địa chỉ của bạn
                </li>
                <li>
                  <strong>Cổng thanh toán:</strong> Để xử lý giao dịch thanh toán an toàn
                </li>
                <li>
                  <strong>Nhà cung cấp dịch vụ:</strong> Email marketing, phân tích dữ liệu
                  (tuân thủ chính sách bảo mật nghiêm ngặt)
                </li>
                <li>
                  <strong>Cơ quan pháp luật:</strong> Khi có yêu cầu hợp pháp
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                6. Cookies và công nghệ theo dõi
              </h2>
              <p>
                Chúng tôi sử dụng cookies và công nghệ tương tự để cải thiện trải nghiệm của bạn.
                Bạn có thể quản lý cookies qua cài đặt trình duyệt. Để biết thêm chi tiết, vui lòng
                xem{" "}
                <Link href="/cookies" className="text-brand-crystal hover:underline">
                  Chính sách Cookies
                </Link>
                .
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                7. Quyền của bạn
              </h2>
              <p className="mb-4">Bạn có các quyền sau đối với thông tin cá nhân của mình:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Truy cập và xem thông tin cá nhân</li>
                <li>Yêu cầu chỉnh sửa hoặc cập nhật thông tin không chính xác</li>
                <li>Yêu cầu xóa thông tin cá nhân (theo quy định pháp luật)</li>
                <li>Rút lại sự đồng ý nhận email marketing bất cứ lúc nào</li>
                <li>Khiếu nại về cách chúng tôi xử lý dữ liệu của bạn</li>
              </ul>
              <p className="mt-4">
                Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi qua email: {" "}
                <a href="mailto:privacy@ngaymoicoto.vn" className="text-brand-crystal hover:underline">
                  privacy@ngaymoicoto.vn
                </a>
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                8. Lưu trữ dữ liệu
              </h2>
              <p>
                Chúng tôi lưu trữ thông tin cá nhân của bạn trong thời gian cần thiết để thực hiện
                các mục đích được nêu trong chính sách này, trừ khi pháp luật yêu cầu hoặc cho phép
                lưu trữ lâu hơn.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                9. Trẻ em
              </h2>
              <p>
                Dịch vụ của chúng tôi không dành cho trẻ em dưới 16 tuổi. Chúng tôi không cố ý
                thu thập thông tin từ trẻ em. Nếu bạn là phụ huynh và phát hiện con bạn đã cung cấp
                thông tin cho chúng tôi, vui lòng liên hệ để chúng tôi xóa thông tin đó.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                10. Cập nhật chính sách
              </h2>
              <p>
                Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi quan trọng
                sẽ được thông báo qua email hoặc thông báo trên website. Phiên bản mới nhất luôn có sẵn
                trên trang này.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                11. Liên hệ
              </h2>
              <p className="mb-4">
                Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ:
              </p>
              <div className="bg-brand-sand/50 p-6 rounded-lg">
                <p className="font-semibold mb-2">Công ty TNHH Ngày Mới Cô Tô</p>
                <p>Email: <a href="mailto:privacy@ngaymoicoto.vn" className="text-brand-crystal hover:underline">privacy@ngaymoicoto.vn</a></p>
                <p>Hotline: <a href="tel:0971155286" className="text-brand-crystal hover:underline">097 115 5286</a></p>
                <p>Địa chỉ: Đảo Cô Tô, Quảng Ninh, Việt Nam</p>
              </div>
            </section>
          </div>

          {/* Navigation Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-6">
            <Link href="/terms" className="text-brand-crystal hover:underline font-medium">
              Điều khoản sử dụng
            </Link>
            <Link href="/cookies" className="text-brand-crystal hover:underline font-medium">
              Chính sách Cookies
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
