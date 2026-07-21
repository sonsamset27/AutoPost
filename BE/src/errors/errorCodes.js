const ErrorCodes = Object.freeze({
    // SYSTEM
    SYS_001: 'SYS_001', //lỗi hệ thống không xác định
    SYS_002: 'SYS_002', // dữ liệu không hợp lệ
    SYS_003: 'SYS_003', // quá nhiều yêu cầu
    //AUTH
    AUTH_001: 'AUTH_001', // accessToken không hợp lệ hoặc hết hạn
    AUTH_002: 'AUTH_002', // refreshToken không hợp lệ hoặc hết hạn
    AUTH_003: 'AUTH_003', // Không có quyền truy cập (Forbidden)
    AUTH_004: 'AUTH_004', // không xác thực 
    // USER
    USER_001: 'USER_001',//không tìm thấy người dùng
    USER_002: 'USER_002',//tài khoản đã tồn tại
    USER_003: 'USER_003',//email hoặc password không hợp lệ
    // VALIDATION
    VALIDATION_001: 'VALIDATION_001',//email không hợp lệ
    // ACCOUNT
    ACC_001: 'ACC_001',//tài khoản đã tồn tại
    ACC_002: 'ACC_002',//không tìm thấy tài khoản
    ACC_003: 'ACC_003',//không tìm thấy người dùng
    ACC_004: 'ACC_004', // không hỗ trợ platform
    // POST
    POST_NOT_FOUND: 'POST_NOT_FOUND', // không tìm thấy bài đăng
    POST_002: 'POST_002', // không thể chỉnh sửa bài đã publish/processing
    // TRANSACTION
    TXN_001: 'TXN_001', // không tìm thấy giao dịch
    TXN_002: 'TXN_002', // thiếu thông tin giao dịch
    // GENERIC
    INVALID_INPUT: 'INVALID_INPUT', // dữ liệu đầu vào không hợp lệ
    INVALID_OPERATION: 'INVALID_OPERATION', // thao tác không hợp lệ
});
export default ErrorCodes;