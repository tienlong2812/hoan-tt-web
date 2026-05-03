import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Giới Thiệu - Hoan TT',
  description: 'Giới thiệu về Công ty TNHH Đầu tư XNK Hoan TT',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 0. Banner Image */}
      <section className="w-full">
        <img 
          src="https://bbwylbgjopclabrnkcdj.supabase.co/storage/v1/object/public/product-images/HoanTT-hoanttbn.jpg" 
          alt="Hoan TT Banner" 
          className="w-full h-auto object-cover max-h-[500px]"
        />
      </section>
      {/* 1. Introduction Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-foreground uppercase">
            Giới thiệu về
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary uppercase mb-10">
            Công ty TNHH Đầu tư XNK Hoan TT
          </h2>
          
          <div className="space-y-6 text-muted-foreground leading-relaxed text-lg text-justify md:text-left">
            <p>
              Được chính thức thành lập năm 2019, cho tới nay, <strong className="text-foreground font-bold">Công ty TNHH Đầu tư XNK Hoan TT</strong> vô cùng tự hào khi là một trong những đơn vị nhập khẩu, phân phối độc quyền và hợp tác phát triển sản phẩm dinh dưỡng cao cấp hàng đầu Việt Nam. Các sản phẩm do Công ty Hoan TT nhập khẩu và phân phối đều là những sản phẩm dinh dưỡng chất lượng cao đến từ những Tập đoàn lớn trên thế giới như <strong className="text-foreground font-bold">Lotte Wellfood</strong> (Hàn Quốc), <strong className="text-foreground font-bold">Biostime</strong> (Úc), <strong className="text-foreground font-bold">Arravite</strong> (Úc),...
            </p>
            <p>
              Những sản phẩm chất lượng cao kết hợp với đội ngũ nhân sự với hàng chục năm kinh nghiệm trong ngành hàng, với sự am hiểu thị trường nội địa, cho đến nay <strong className="text-foreground font-bold">Công ty Hoan TT</strong> đã đưa thành công nhiều sản phẩm dinh dưỡng nhập khẩu trở thành những sản phẩm có chỗ đứng vững chắc trên thị trường Việt Nam. Các sản phẩm sữa <strong className="text-foreground font-bold">Biostime, Lotte Kid A+, men vi sinh SYSY, Bột nêm cao cấp Massel</strong>... đã có mức độ nhận diện thương hiệu cao, mạng lưới phân phối rộng khắp các tỉnh thành và đang bước đầu đạt được những bước đi vững chắc về mặt doanh thu.
            </p>
            <p>
              Bên cạnh những Đối tác lớn kể trên, có được sự thành công hôm nay đó là nhờ sự hợp tác tốt đẹp, bền vững từ những khách hàng lớn, uy tín là các Hệ thống Siêu thị Mẹ và Bé, các đại lý lớn của Việt Nam tại các 63 tỉnh thành, đặc biệt tại các thành phố lớn như Hà Nội, Hồ Chí Minh, Đà Nẵng, Hải Dương, Hưng Yên, Hải Phòng...
            </p>
          </div>
        </div>
      </section>

      {/* 2. Business Criteria & Timeline Section */}
      <section className="w-full py-16 md:py-24 bg-muted/10 border-y">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            
            {/* Left Content */}
            <div className="sticky top-28">
              <h2 className="text-3xl font-bold tracking-tight text-primary uppercase mb-2">
                Tiêu chí kinh doanh
              </h2>
              <h3 className="text-3xl font-bold tracking-tight text-foreground uppercase mb-8">
                Của chúng tôi
              </h3>
              <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                <p>
                  Hoan TT luôn mong muốn tập trung xây dựng và phát triển mối quan hệ giữa các đối tác, luôn là sự tin cậy, uy tín lâu dài.
                </p>
                <p>
                  Chúng tôi vẫn không ngừng nỗ lực nghiên cứu, tìm kiếm và phân phối các sản phẩm có thương hiệu và chất lượng hàng đầu thế giới tại Việt Nam và mang lại nhiều giá trị cho đối tác và người tiêu dùng.
                </p>
              </div>
            </div>

            {/* Right Timeline */}
            <div className="relative border-l-2 border-primary/20 pl-8 md:pl-12 space-y-12 py-4">
              {/* Timeline Item 1 */}
              <div className="relative">
                <div className="absolute -left-[41px] md:-left-[57px] top-4 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center p-1 shadow-sm">
                   <img src="/logo.png" alt="Hoan TT icon" className="object-contain" />
                </div>
                <Card className="border-0 shadow-md overflow-hidden bg-white">
                  <div className="bg-primary text-white font-bold text-lg px-6 py-3">
                    Năm 2022
                  </div>
                  <CardContent className="p-6">
                    <p className="text-foreground leading-relaxed">
                      <strong className="font-bold">Hoan TT</strong> là đơn vị nhập khẩu và phân phối độc quyền các thương hiệu <strong className="font-bold">Hydrodol, Arravite, Impero Red Wine</strong> tại Việt Nam.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline Item 2 */}
              <div className="relative">
                <div className="absolute -left-[41px] md:-left-[57px] top-4 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center p-1 shadow-sm">
                   <img src="/logo.png" alt="Hoan TT icon" className="object-contain" />
                </div>
                <Card className="border-0 shadow-md overflow-hidden bg-white">
                  <div className="bg-primary text-white font-bold text-lg px-6 py-3">
                    Tháng 07 năm 2023
                  </div>
                  <CardContent className="p-6">
                    <p className="text-foreground leading-relaxed">
                      <strong className="font-bold">Hoan TT</strong> là đơn vị nhập khẩu và nhà phân phối độc quyền các sản phẩm thuộc thương hiệu <strong className="font-bold">Hồng Sâm hữu cơ Hàn Quốc KJH</strong> - Hồng sâm hữu cơ đầu tiên và duy nhất trên thế giới.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline Item 3 */}
              <div className="relative">
                <div className="absolute -left-[41px] md:-left-[57px] top-4 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center p-1 shadow-sm">
                   <img src="/logo.png" alt="Hoan TT icon" className="object-contain" />
                </div>
                <Card className="border-0 shadow-md overflow-hidden bg-white">
                  <div className="bg-primary text-white font-bold text-lg px-6 py-3">
                    Tháng 12 năm 2023
                  </div>
                  <CardContent className="p-6">
                    <p className="text-foreground leading-relaxed">
                      <strong className="font-bold">Hoan TT</strong> trở thành đơn vị nhập khẩu và phân phối độc quyền các thương hiệu: <strong className="font-bold">Massel, Hair Restore Advanced, Norco, Sheveu, MamaCare, BioRevive</strong> tại thị trường Việt Nam.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Operating Ideals Section */}
      <section className="w-full py-16 md:py-24 mb-10">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary uppercase mb-2">
              Lý tưởng hoạt động
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground uppercase">
              Của chúng tôi
            </h3>
            <div className="w-24 h-1 bg-muted-foreground/20 mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Uy Tín",
                desc: "Đặt chữ tín lên hàng đầu, lời nói đi đôi với việc làm, tạo niềm tin cho khách hàng, đối tác."
              },
              {
                title: "Hợp Tác",
                desc: "Hợp tác để cùng nhau phát triển và thành công."
              },
              {
                title: "Chất Lượng",
                desc: "Luôn lựa chọn các sản phẩm thực phẩm, dinh dưỡng có thương hiệu và chất lượng hàng đầu thế giới để phục vụ khách hàng."
              },
              {
                title: "Tâm Huyết",
                desc: "Nỗ lực không ngừng tìm kiếm, cung cấp các sản phẩm thực phẩm dinh dưỡng tốt nhất đến khách hàng vì nền dinh dưỡng của thế hệ tương lai."
              }
            ].map((ideal, idx) => (
              <Card key={idx} className="bg-blue-50/80 hover:bg-blue-100/60 border-none shadow-none rounded-none h-full transition-colors">
                <CardContent className="p-8 md:p-10 flex flex-col h-full items-start text-left">
                  <h4 className="text-xl md:text-2xl font-bold text-foreground uppercase mb-6">{ideal.title}</h4>
                  <p className="text-muted-foreground text-[15px] leading-relaxed">
                    {ideal.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
