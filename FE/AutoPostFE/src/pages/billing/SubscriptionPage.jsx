import React, { useState } from 'react';
import { Card, Button, Modal, Spin, message, Typography } from 'antd';
import { CheckCircle2, Crown, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import transactionApi from '../../api/transactionApi';

const { Title, Paragraph } = Typography;

const SubscriptionPage = () => {
  const { user, fetchProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await transactionApi.createPayment();
      setPaymentData(res.data);
      setModalOpen(true);
    } catch (error) {
      message.error(error.message || 'Lỗi khi tạo liên kết thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    // In a real app, you would poll the server or wait for a webhook
    // Here we just refresh the profile to see if the plan changed
    message.loading({ content: 'Đang kiểm tra trạng thái thanh toán...', key: 'payment' });
    await fetchProfile();
    setTimeout(() => {
      if (user?.plan === 'pro') {
        message.success({ content: 'Nâng cấp thành công!', key: 'payment' });
        setModalOpen(false);
      } else {
        message.info({ content: 'Giao dịch đang được xử lý, vui lòng chờ thêm...', key: 'payment' });
      }
    }, 1000);
  };

  const PlanFeature = ({ text }) => (
    <div className="flex items-center gap-3 mb-4">
      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
      <span className="text-slate-600 dark:text-slate-300">{text}</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl mb-2">
          <Zap className="w-8 h-8 text-indigo-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          Nâng Cấp Gói Dịch Vụ AutoPost <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-violet-500">PRO</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
          Mở khóa toàn bộ sức mạnh tự động hóa đăng bài đa nền tảng không giới hạn.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* FREE PLAN */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-900/50 hover:shadow-lg transition-shadow">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">GÓI FREE</h2>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold text-slate-800 dark:text-white">0đ</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium mb-1">/ tháng</span>
            </div>
          </div>
          <div className="px-2">
            <PlanFeature text="Tối đa 3 tài khoản MXH" />
            <PlanFeature text="30 bài đăng / tháng" />
            <PlanFeature text="Hẹn giờ tối đa 24h" />
            <PlanFeature text="Chỉ đăng bài dạng chữ (Text)" />
            <PlanFeature text="Bài viết tự xóa sau 7 ngày" />
          </div>
          <div className="mt-8 pt-4">
            <Button block size="large" className="rounded-xl h-12 font-semibold" disabled={user?.plan === 'free'}>
              {user?.plan === 'free' ? 'Đang Sử Dụng' : 'Hạ Cấp Xuống Free'}
            </Button>
          </div>
        </Card>

        {/* PRO PLAN */}
        <Card className="rounded-2xl border-2 border-indigo-500 dark:border-indigo-500 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900/50 shadow-xl relative overflow-hidden transform md:-translate-y-4">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-violet-500 text-white font-bold text-xs px-4 py-1 rounded-bl-xl uppercase tracking-wider">
            Khuyên Dùng
          </div>
          <div className="p-4 border-b border-indigo-100 dark:border-indigo-900/50 mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-violet-500 mb-2 flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" /> GÓI PRO
            </h2>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold text-slate-800 dark:text-white">100.000đ</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium mb-1">/ 30 ngày</span>
            </div>
          </div>
          <div className="px-2">
            <PlanFeature text={<strong className="dark:text-white">Không giới hạn</strong>} />
            <PlanFeature text={<strong className="dark:text-white">Không giới hạn bài đăng</strong>} />
            <PlanFeature text="Hẹn giờ không giới hạn tương lai" />
            <PlanFeature text="Đăng đính kèm tối đa 5 Ảnh/Video qua Cloud" />
            <PlanFeature text="Lưu trữ lịch sử bài đăng vĩnh viễn" />
          </div>
          <div className="mt-8 pt-4">
            {user?.plan === 'pro' ? (
              <Button block size="large" className="rounded-xl h-12 font-semibold bg-emerald-500 hover:bg-emerald-600 text-white border-none" disabled>
                Đang Sử Dụng Gói PRO
              </Button>
            ) : (
              <Button 
                block 
                size="large" 
                type="primary" 
                className="rounded-xl h-12 font-semibold bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 border-none shadow-lg shadow-indigo-500/30"
                loading={loading}
                onClick={handleUpgrade}
              >
                Nâng Cấp Ngay Qua PayOS
              </Button>
            )}
          </div>
        </Card>
      </div>

      <Modal
        title={null}
        footer={null}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={400}
        centered
        destroyOnClose
      >
        {paymentData ? (
          <div className="text-center py-6">
            <h3 className="text-xl font-bold mb-2">Thanh Toán Bằng Mã QR</h3>
            <p className="text-slate-500 mb-6">Mã giao dịch: {paymentData.transaction?.orderCode}</p>
            
            <div className="bg-slate-100 rounded-xl p-4 mb-6 inline-block">
              {/* Dummy QR placeholder for mock */}
              <div className="w-48 h-48 bg-white border border-slate-200 flex items-center justify-center rounded">
                <span className="text-slate-400 text-sm">QR Code Mockup<br/>(Link PayOS)</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                type="primary" 
                block 
                className="h-10 bg-indigo-600"
                href={paymentData.checkoutUrl} 
                target="_blank"
              >
                Mở Trang Thanh Toán PayOS
              </Button>
              <Button block className="h-10" onClick={checkPaymentStatus}>
                Tôi đã thanh toán xong
              </Button>
            </div>
          </div>
        ) : <Spin />}
      </Modal>
    </div>
  );
};

export default SubscriptionPage;
