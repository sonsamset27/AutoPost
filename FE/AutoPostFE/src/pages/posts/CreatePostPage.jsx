import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Upload, DatePicker, Row, Col, Card, Spin, App } from 'antd';
import { UploadCloud, Clock, Send, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import accountApi from '../../api/accountApi';
import postApi from '../../api/postApi';
import mediaApi from '../../api/mediaApi';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Dragger } = Upload;

const CreatePostPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  
  const [fileList, setFileList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { id } = useParams();
  const [previewContent, setPreviewContent] = useState('');
  const [loadingPost, setLoadingPost] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        setLoadingPost(true);
        try {
          const res = await postApi.getPostById(id);
          const post = res.data;
          
          form.setFieldsValue({
            content: post.content,
            accountIds: post.accountIds?.map(acc => typeof acc === 'object' ? acc._id : acc) || [],
            scheduledAt: post.scheduledAt ? dayjs(post.scheduledAt) : null,
          });
          setPreviewContent(post.content);
          
          if (post.mediaUrls && post.mediaUrls.length > 0) {
            setFileList(post.mediaUrls.map((url, i) => ({
              uid: `-${i}`,
              name: `media-${i}`,
              status: 'done',
              url: url
            })));
          }
        } catch (error) {
          message.error('Không thể lấy dữ liệu bài viết');
        } finally {
          setLoadingPost(false);
        }
      };
      fetchPost();
    }
  }, [id, form]);

  useEffect(() => {
    const fetchActiveAccounts = async () => {
      try {
        const res = await accountApi.getAccounts({ isActive: true });
        setAccounts((res.data || []).filter(a => a.isActive));
      } catch (error) {
        if (error.statusCode !== 404) {
          message.error('Lỗi lấy danh sách tài khoản');
        }
        // 404 = không có tài khoản nào, bình thường
      } finally {
        setLoadingAccounts(false);
      }
    };
    fetchActiveAccounts();
  }, []);

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('media', file);

    setIsUploading(true);
    try {
      const res = await mediaApi.uploadMedia(formData);
      const url = res.data?.mediaUrls?.[0];
      if (url) {
        file.url = url;
        onSuccess("Ok");
        message.success(`${file.name} tải lên thành công.`);
      } else {
        throw new Error("Không nhận được URL ảnh");
      }
    } catch (err) {
      onError({ err });
      message.error(`${file.name} tải lên thất bại.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (info) => {
    setFileList(info.fileList);
  };

  const onFinish = async (values) => {
    if (!values.accountIds || values.accountIds.length === 0) {
      return message.error('Vui lòng chọn ít nhất 1 tài khoản để đăng!');
    }
    
    setSubmitting(true);
    try {
      const mediaUrls = fileList.map(f => f.url || f.response?.url).filter(Boolean);
      
      const payload = {
        content: values.content,
        accountIds: values.accountIds,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      };

      if (values.scheduledAt) {
        payload.scheduledAt = values.scheduledAt.toISOString();
      } else {
        payload.scheduledAt = null;
      }

      if (id) {
        await postApi.updatePost(id, payload);
        message.success('Bài viết đã được cập nhật thành công!');
      } else {
        await postApi.createPost(payload);
        message.success('Bài viết đã được tạo thành công!');
      }
      navigate('/posts');
    } catch (error) {
      message.error(error.message || 'Lỗi khi tạo bài viết');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {id ? 'Cập Nhật Bài Viết' : 'Soạn Bài Viết Mới'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Thiết lập nội dung, hẹn giờ và phát đa nền tảng</p>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm">
            <Form 
              form={form} 
              layout="vertical" 
              onFinish={onFinish}
              onValuesChange={(changedValues, allValues) => {
                if (changedValues.content !== undefined) setPreviewContent(changedValues.content);
              }}
            >
              <Form.Item 
                name="accountIds" 
                label={<span className="font-semibold dark:text-slate-200">1. Chọn tài khoản đích</span>}
              >
                {loadingAccounts ? <Spin /> : accounts.length === 0 ? (
                  <div className="text-amber-500">Chưa có tài khoản nào hoạt động. Hãy kết nối tài khoản trước.</div>
                ) : (
                  <Checkbox.Group className="w-full">
                    <Row gutter={[12, 12]}>
                      {accounts.map(acc => (
                        <Col xs={24} sm={12} key={acc._id}>
                          <Checkbox value={acc._id} className="dark:text-slate-300">
                            <span className="capitalize font-medium text-indigo-500 mr-1">[{acc.platform}]</span> 
                            <span className="truncate inline-block align-bottom max-w-[150px]">{acc.platformAccountName}</span>
                          </Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                )}
              </Form.Item>

              <Form.Item 
                name="content" 
                label={<span className="font-semibold dark:text-slate-200">2. Nội dung bài viết</span>}
                rules={[{ required: true, message: 'Nội dung không được để trống!' }]}
              >
                <TextArea 
                  rows={6} 
                  placeholder="Nhập nội dung bài viết vào đây (Hỗ trợ định dạng Markdown cơ bản)..." 
                  className="rounded-lg"
                  showCount
                  maxLength={4000}
                />
              </Form.Item>

              <Form.Item 
                label={<span className="font-semibold dark:text-slate-200">3. Đính kèm File Media (Chỉ gói PRO)</span>}
              >
                <div className="relative">
                  <Dragger 
                    multiple 
                    maxCount={5}
                    customRequest={handleUpload}
                    onChange={handleChange}
                    fileList={fileList}
                    disabled={user?.plan === 'free'}
                    accept="image/*,video/*"
                    className={user?.plan === 'free' ? 'opacity-50' : ''}
                  >
                    <p className="ant-upload-drag-icon flex justify-center text-indigo-500">
                      <UploadCloud className="w-10 h-10" />
                    </p>
                    <p className="ant-upload-text dark:text-slate-300">Kéo thả ảnh hoặc click để tải lên</p>
                    <p className="ant-upload-hint dark:text-slate-400">
                      Hỗ trợ tối đa 5 file ảnh/video (tối đa 10MB/file).
                    </p>
                  </Dragger>
                  
                  {user?.plan === 'free' && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/10 dark:bg-slate-900/50 rounded-lg cursor-not-allowed">
                      <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-lg text-amber-500 text-sm font-medium border border-amber-200 dark:border-amber-800">
                        🔒 Đính kèm Media chỉ dành cho gói PRO
                      </div>
                    </div>
                  )}
                </div>
              </Form.Item>

              <Form.Item 
                name="scheduledAt" 
                label={<span className="font-semibold dark:text-slate-200">4. Lịch đăng bài</span>}
              >
                <DatePicker 
                  showTime 
                  format="DD/MM/YYYY HH:mm"
                  placeholder="Chọn ngày giờ (Bỏ trống để đăng ngay)"
                  className="w-full rounded-lg h-10"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>

              <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<Send className="w-4 h-4" />}
                  loading={submitting || isUploading || loadingPost}
                  className="bg-indigo-600 hover:bg-indigo-700 h-10 px-8 rounded-lg shadow-indigo-500/30"
                >
                  {id ? 'Cập Nhật Bài Viết' : 'Đăng Bài / Hẹn Giờ'}
                </Button>
                <Button 
                  className="h-10 px-8 rounded-lg"
                  onClick={() => navigate('/posts')}
                >
                  Hủy
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <div className="sticky top-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Xem trước hiển thị (Preview)</h3>
            <div className="bg-slate-100 dark:bg-slate-800 p-2 sm:p-4 rounded-3xl sm:rounded-[2rem] border-4 sm:border-8 border-slate-200 dark:border-slate-700 shadow-xl relative min-h-[300px] sm:min-h-[400px]">
              {/* Phone notch mockup */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded-b-xl" />
              
              <div className="mt-8 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <Send className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">AutoPost Bot</h4>
                    <p className="text-xs text-slate-400">Vừa xong</p>
                  </div>
                </div>
                
                <div className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap font-sans">
                  {previewContent || <span className="text-slate-400 italic">Nội dung bài viết sẽ hiển thị ở đây...</span>}
                </div>

                {fileList.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                    {fileList.map((file, idx) => (
                      <div key={idx} className="aspect-video bg-slate-100 dark:bg-slate-800 relative">
                        {file.url ? (
                          <img src={file.url} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-slate-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CreatePostPage;
