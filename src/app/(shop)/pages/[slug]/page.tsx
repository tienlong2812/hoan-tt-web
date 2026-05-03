import { notFound } from 'next/navigation';

const pageContents: Record<string, { title: string; content: React.ReactNode }> = {
  contact: {
    title: 'Liên Hệ',
    content: (
      <div className="space-y-4">
        <p>Cảm ơn quý khách đã quan tâm đến sản phẩm của HOAN TT. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Công ty:</strong> TNHH Đầu tư XNK HOAN TT</li>
          <li><strong>Địa chỉ:</strong> ML 6-17 Vinhomes Greenbay Mễ Trì, phường Đại Mỗ, Hà Nội</li>
          <li><strong>Hotline:</strong> 08129.111.88</li>
          <li><strong>Email:</strong> hoanttcompany@hoantt.vn</li>
        </ul>
        <p>Đội ngũ chăm sóc khách hàng của chúng tôi hoạt động từ 8h00 đến 17h30 các ngày từ Thứ 2 đến Thứ 7.</p>
      </div>
    )
  },
  faq: {
    title: 'Câu Hỏi Thường Gặp',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">1. Làm thế nào để đặt hàng?</h3>
          <p>Quý khách có thể thêm sản phẩm vào giỏ hàng và tiến hành thanh toán trực tiếp trên website, hoặc liên hệ qua Hotline 08129.111.88 để được hỗ trợ.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">2. Hàng nhập khẩu có chính hãng không?</h3>
          <p>HOAN TT cam kết 100% sản phẩm là hàng chính hãng, có nguồn gốc xuất xứ rõ ràng và đầy đủ giấy tờ kiểm định theo quy định của pháp luật Việt Nam.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">3. Thời gian giao hàng là bao lâu?</h3>
          <p>Thời gian giao hàng từ 1-3 ngày đối với khu vực nội thành Hà Nội và từ 3-5 ngày đối với các tỉnh thành khác.</p>
        </div>
      </div>
    )
  },
  shipping: {
    title: 'Chính Sách Giao Hàng',
    content: (
      <div className="space-y-4">
        <p>HOAN TT cung cấp dịch vụ giao hàng tận nơi trên toàn quốc với chính sách như sau:</p>
        <h3 className="text-lg font-semibold mt-6 mb-2">1. Chi phí vận chuyển</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Miễn phí giao hàng:</strong> Áp dụng cho tất cả các đơn hàng có giá trị thanh toán từ 1.000.000 VNĐ trở lên.</li>
          <li><strong>Phí giao hàng tiêu chuẩn:</strong> 30.000 VNĐ áp dụng cho các đơn hàng dưới 1.000.000 VNĐ.</li>
        </ul>
        <h3 className="text-lg font-semibold mt-6 mb-2">2. Đơn vị vận chuyển</h3>
        <p>Chúng tôi hợp tác với các đơn vị vận chuyển uy tín như Viettel Post, GHTK, J&T Express để đảm bảo hàng hóa đến tay quý khách nhanh chóng và an toàn nhất.</p>
      </div>
    )
  },
  returns: {
    title: 'Đổi Trả & Hoàn Tiền',
    content: (
      <div className="space-y-4">
        <p>Chính sách đổi trả được áp dụng nhằm bảo vệ quyền lợi của khách hàng khi mua sắm tại HOAN TT.</p>
        <h3 className="text-lg font-semibold mt-6 mb-2">1. Điều kiện đổi trả</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Sản phẩm bị lỗi do nhà sản xuất hoặc hư hỏng trong quá trình vận chuyển.</li>
          <li>Sản phẩm giao không đúng với đơn đặt hàng (sai loại, sai mẫu mã).</li>
          <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng và còn giữ lại hóa đơn mua hàng.</li>
        </ul>
        <h3 className="text-lg font-semibold mt-6 mb-2">2. Thời gian đổi trả</h3>
        <p>Quý khách vui lòng yêu cầu đổi trả trong vòng 7 ngày kể từ ngày nhận được hàng.</p>
        <h3 className="text-lg font-semibold mt-6 mb-2">3. Hoàn tiền</h3>
        <p>Tiền sẽ được hoàn lại vào tài khoản ngân hàng của quý khách trong vòng 3-5 ngày làm việc sau khi chúng tôi nhận lại được hàng hoàn trả hợp lệ.</p>
      </div>
    )
  },
  terms: {
    title: 'Điều Khoản Dịch Vụ',
    content: (
      <div className="space-y-4 text-justify">
        <p>Chào mừng quý khách đến với website thương mại điện tử HOAN TT. Bằng việc truy cập và mua sắm tại website, quý khách đồng ý với các điều khoản dưới đây.</p>
        <h3 className="text-lg font-semibold mt-6 mb-2">1. Trách nhiệm của người dùng</h3>
        <p>Quý khách cam kết cung cấp thông tin cá nhân và thông tin giao hàng chính xác khi đặt hàng. Chúng tôi không chịu trách nhiệm đối với các trường hợp thất lạc hàng hóa do thông tin sai lệch.</p>
        <h3 className="text-lg font-semibold mt-6 mb-2">2. Quyền sở hữu trí tuệ</h3>
        <p>Toàn bộ nội dung, hình ảnh, logo trên website đều thuộc quyền sở hữu của Công ty TNHH Đầu tư XNK HOAN TT. Mọi hành vi sao chép mà không được phép đều là vi phạm pháp luật.</p>
      </div>
    )
  },
  privacy: {
    title: 'Chính Sách Bảo Mật',
    content: (
      <div className="space-y-4 text-justify">
        <p>Chúng tôi hiểu rằng quyền riêng tư của quý khách là vô cùng quan trọng. HOAN TT cam kết bảo vệ tuyệt đối thông tin cá nhân của người dùng.</p>
        <h3 className="text-lg font-semibold mt-6 mb-2">1. Thu thập thông tin</h3>
        <p>Chúng tôi chỉ thu thập thông tin cần thiết phục vụ cho việc giao hàng và chăm sóc khách hàng, bao gồm: Họ tên, Số điện thoại, Email, Địa chỉ giao hàng.</p>
        <h3 className="text-lg font-semibold mt-6 mb-2">2. Sử dụng thông tin</h3>
        <p>Thông tin của quý khách sẽ chỉ được dùng nội bộ và cam kết không bán, trao đổi hoặc chia sẻ cho bất kỳ bên thứ 3 nào vì mục đích thương mại.</p>
        <h3 className="text-lg font-semibold mt-6 mb-2">3. Bảo mật</h3>
        <p>Mọi giao dịch thanh toán và dữ liệu cá nhân đều được mã hóa và bảo vệ an toàn trên hệ thống máy chủ của chúng tôi.</p>
      </div>
    )
  }
};

export default async function GenericPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const pageData = pageContents[params.slug];

  if (!pageData) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[50vh]">
      <div className="bg-card border rounded-2xl p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-8 text-primary border-b pb-4">{pageData.title}</h1>
        <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-primary">
          {pageData.content}
        </div>
      </div>
    </div>
  );
}
