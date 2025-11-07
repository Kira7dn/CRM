import { Container } from "@/app/(landing-page)/components/ui/Container";
import { SectionHeading } from "@/app/(landing-page)/components/ui/SectionHeading";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng | Ngày Mới Cô Tô",
  description: "Điều khoản và điều kiện sử dụng dịch vụ của Ngày Mới Cô Tô - Hải sản tươi sống từ Cô Tô",
};

export default function TermsOfUsePage() {
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
            Điều khoản sử dụng
          </SectionHeading>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <p className="text-sm text-gray-500">
              Cập nhật lần cuối: Tháng 11, 2025
            </p>

            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                1. Chấp nhận điều khoản
              </h2>
              <p>
                Chào mừng bạn đến với Ngày Mới Cô Tô. Bằng việc truy cập và sử dụng website này,
                bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sau đây. Nếu
                bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng
                dịch vụ của chúng tôi.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                2. Định nghĩa
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>"Chúng tôi"</strong> hoặc <strong>"Ngày Mới Cô Tô"</strong> đề cập đến
                  Công ty TNHH Ngày Mới Cô Tô và các dịch vụ liên quan.
                </li>
                <li>
                  <strong>"Bạn"</strong> hoặc <strong>"Khách hàng"</strong> đề cập đến người dùng
                  truy cập website và sử dụng dịch vụ.
                </li>
                <li>
                  <strong>"Dịch vụ"</strong> bao gồm website, ứng dụng di động, và tất cả các sản phẩm
                  hải sản chúng tôi cung cấp.
                </li>
                <li>
                  <strong>"Sản phẩm"</strong> là các loại hải sản tươi sống, đông lạnh và chế biến
                  được bán trên nền tảng của chúng tôi.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                3. Tài khoản người dùng
              </h2>
              <p className="mb-4">
                Để sử dụng một số tính năng của dịch vụ, bạn cần tạo tài khoản:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Bạn phải cung cấp thông tin chính xác và đầy đủ khi đăng ký</li>
                <li>Bạn chịu trách nhiệm duy trì bảo mật tài khoản và mật khẩu</li>
                <li>Bạn phải thông báo ngay cho chúng tôi về bất kỳ truy cập trái phép nào</li>
                <li>Bạn phải từ 16 tuổi trở lên để tạo tài khoản</li>
                <li>Một người chỉ có thể tạo một tài khoản duy nhất</li>
                <li>Chúng tôi có quyền đình chỉ hoặc xóa tài khoản vi phạm điều khoản</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                4. Đặt hàng và thanh toán
              </h2>

              <h3 className="text-xl font-semibold text-brand-charcoal mb-3 mt-6">
                4.1. Quy trình đặt hàng
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Chọn sản phẩm và thêm vào giỏ hàng</li>
                <li>Xác nhận thông tin giao hàng và thanh toán</li>
                <li>Hoàn tất thanh toán theo phương thức đã chọn</li>
                <li>Nhận xác nhận đơn hàng qua email/SMS</li>
              </ul>

              <h3 className="text-xl font-semibold text-brand-charcoal mb-3 mt-6">
                4.2. Giá cả và khuyến mãi
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Giá sản phẩm có thể thay đổi mà không cần thông báo trước</li>
                <li>Giá hiển thị khi đặt hàng là giá cuối cùng bạn phải thanh toán</li>
                <li>Chương trình khuyến mãi có thời hạn và điều kiện cụ thể</li>
                <li>Chúng tôi có quyền hủy đơn hàng nếu phát hiện lỗi giá hiển thị</li>
              </ul>

              <h3 className="text-xl font-semibold text-brand-charcoal mb-3 mt-6">
                4.3. Phương thức thanh toán
              </h3>
              <p>Chúng tôi chấp nhận các phương thức thanh toán sau:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Thanh toán khi nhận hàng (COD)</li>
                <li>Chuyển khoản ngân hàng</li>
                <li>Ví điện tử (Momo, ZaloPay, VNPay)</li>
                <li>Thẻ tín dụng/ghi nợ quốc tế (Visa, Mastercard)</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                5. Giao hàng
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Khu vực giao hàng:</strong> Hiện tại chúng tôi giao hàng trong toàn quốc,
                  ưu tiên khu vực Hà Nội, TP.HCM và các tỉnh phía Bắc.
                </li>
                <li>
                  <strong>Thời gian giao hàng:</strong> 24-48h cho hải sản tươi sống (khu vực nội thành),
                  3-5 ngày cho các tỉnh xa.
                </li>
                <li>
                  <strong>Phí vận chuyển:</strong> Được tính dựa trên trọng lượng, khoảng cách và
                  phương thức vận chuyển (thông thường, nhanh, hỏa tốc).
                </li>
                <li>
                  <strong>Đóng gói:</strong> Hải sản được đóng gói trong thùng xốp chuyên dụng với
                  đá gel/đá viên, đảm bảo nhiệt độ lạnh (-18°C) trong suốt quá trình vận chuyển.
                </li>
                <li>
                  <strong>Trách nhiệm khi nhận hàng:</strong> Vui lòng kiểm tra hàng trước khi ký nhận.
                  Chúng tôi không chịu trách nhiệm nếu bạn phát hiện vấn đề sau khi đã ký xác nhận.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                6. Chính sách đổi trả và hoàn tiền
              </h2>

              <h3 className="text-xl font-semibold text-brand-charcoal mb-3 mt-6">
                6.1. Điều kiện đổi trả
              </h3>
              <p className="mb-4">Chúng tôi chấp nhận đổi trả trong các trường hợp sau:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sản phẩm bị hư hỏng, không đảm bảo chất lượng khi giao hàng</li>
                <li>Giao sai sản phẩm hoặc thiếu số lượng</li>
                <li>Sản phẩm không còn tươi do lỗi bảo quản/vận chuyển của chúng tôi</li>
              </ul>

              <h3 className="text-xl font-semibold text-brand-charcoal mb-3 mt-6">
                6.2. Quy trình đổi trả
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Thông báo cho chúng tôi trong vòng 24h kể từ khi nhận hàng</li>
                <li>Cung cấp hình ảnh/video sản phẩm lỗi</li>
                <li>Giữ nguyên bao bì và tem nhãn sản phẩm</li>
                <li>Chúng tôi sẽ xác nhận và xử lý trong 24-48h</li>
              </ul>

              <h3 className="text-xl font-semibold text-brand-charcoal mb-3 mt-6">
                6.3. Hoàn tiền
              </h3>
              <p>
                Hoàn tiền được thực hiện trong 7-14 ngày làm việc theo phương thức thanh toán ban đầu.
                Phí vận chuyển sẽ được hoàn lại nếu lỗi thuộc về chúng tôi.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                7. Quyền sở hữu trí tuệ
              </h2>
              <p className="mb-4">
                Tất cả nội dung trên website (văn bản, hình ảnh, logo, video, thiết kế) đều thuộc
                sở hữu của Ngày Mới Cô Tô và được bảo vệ bởi luật sở hữu trí tuệ Việt Nam:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Bạn không được sao chép, sửa đổi, hoặc phân phối nội dung mà không có sự cho phép</li>
                <li>Bạn có thể chia sẻ link website nhưng không được đăng tải lại toàn bộ nội dung</li>
                <li>Logo "Ngày Mới Cô Tô" là nhãn hiệu đã đăng ký</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                8. Hành vi bị cấm
              </h2>
              <p className="mb-4">Khi sử dụng dịch vụ của chúng tôi, bạn KHÔNG ĐƯỢC:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sử dụng dịch vụ cho mục đích bất hợp pháp</li>
                <li>Tấn công, hack, hoặc phá hoại hệ thống website</li>
                <li>Đăng tải nội dung spam, virus, malware</li>
                <li>Giả mạo thông tin hoặc tạo nhiều tài khoản ảo</li>
                <li>Sử dụng bot, script tự động để đặt hàng hoặc thu thập thông tin</li>
                <li>Đăng tải đánh giá giả mạo hoặc vu khống</li>
                <li>Lạm dụng chương trình khuyến mãi hoặc hoàn tiền</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                9. Giới hạn trách nhiệm
              </h2>
              <p className="mb-4">Chúng tôi cam kết cung cấp dịch vụ tốt nhất, tuy nhiên:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Chúng tôi không chịu trách nhiệm về sự gián đoạn dịch vụ do lỗi kỹ thuật,
                  thiên tai, hoặc các yếu tố bất khả kháng
                </li>
                <li>
                  Chúng tôi không đảm bảo website luôn hoạt động 100% không lỗi
                </li>
                <li>
                  Chúng tôi không chịu trách nhiệm về thiệt hại gián tiếp, mất mát lợi nhuận
                  do việc sử dụng hoặc không thể sử dụng dịch vụ
                </li>
                <li>
                  Trách nhiệm tối đa của chúng tôi không vượt quá giá trị đơn hàng bạn đã thanh toán
                </li>
              </ul>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                10. Luật áp dụng và giải quyết tranh chấp
              </h2>
              <p>
                Các điều khoản này được điều chỉnh bởi luật pháp Việt Nam. Mọi tranh chấp phát sinh
                sẽ được ưu tiên giải quyết thông qua thương lượng hòa giải. Nếu không đạt được thỏa
                thuận, tranh chấp sẽ được đưa ra Tòa án có thẩm quyền tại Việt Nam.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                11. Thay đổi điều khoản
              </h2>
              <p>
                Chúng tôi có quyền thay đổi hoặc cập nhật các điều khoản này bất cứ lúc nào.
                Những thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo trên website.
                Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp
                nhận các điều khoản mới.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
                12. Liên hệ
              </h2>
              <p className="mb-4">
                Nếu bạn có bất kỳ câu hỏi nào về các điều khoản sử dụng này, vui lòng liên hệ:
              </p>
              <div className="bg-brand-sand/50 p-6 rounded-lg">
                <p className="font-semibold mb-2">Công ty TNHH Ngày Mới Cô Tô</p>
                <p>Email: <a href="mailto:support@ngaymoicoto.vn" className="text-brand-crystal hover:underline">support@ngaymoicoto.vn</a></p>
                <p>Hotline: <a href="tel:0971155286" className="text-brand-crystal hover:underline">097 115 5286</a></p>
                <p>Địa chỉ: Đảo Cô Tô, Quảng Ninh, Việt Nam</p>
                <p className="mt-2 text-sm">Thời gian làm việc: 8:00 - 20:00 (Thứ 2 - Chủ nhật)</p>
              </div>
            </section>
          </div>

          {/* Navigation Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-6">
            <Link href="/privacy" className="text-brand-crystal hover:underline font-medium">
              Chính sách bảo mật
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
