/**
 * ==============================================================
 * AUTOPOST - COMPREHENSIVE E2E TEST SUITE
 * ==============================================================
 * Kiểm tra toàn bộ hệ thống (Auth, Account, Post, Admin, Transaction)
 * và toàn bộ giới hạn của các gói (FREE / PRO) cũng như validators.
 */

import axios from 'axios';
import mongoose from 'mongoose';
import 'dotenv/config';

const BASE_URL = 'http://localhost:3027/api/v1';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1529079984914956338/cLR-Wklvap0JT_TyzFxrnvwZYDQ5b_WShGsDNFPaC-1dHwNWDQvRJ7P8f2ADZE4czHU0';
const TELEGRAM_CONFIG = {
    botToken: '8856059550:AAFSK2joqJLuC2PC2ItYLxii2xZLiu2WvyI',
    chatId: '-1002203514094'
};

const results = [];
let adminCookies = '';
let freeUser = { email: `free_${Date.now()}@test.com`, password: 'Password123!', cookies: '', id: '' };
let proUser = { email: `pro_${Date.now()}@test.com`, password: 'Password123!', cookies: '', id: '' };

const tgAccountId = { free: null, pro: null };
const discordAccountId = { free: null, pro: null };

function assert(condition, message, testName) {
    if (!condition) {
        console.log(`  ❌ THẤT BẠI: ${message}`);
        throw new Error(message);
    }
}

async function runTest(testName, testFn) {
    console.log(`\n📌 [TEST] ${testName}`);
    try {
        await testFn();
        console.log(`  ✅ THÀNH CÔNG`);
        results.push({ name: testName, passed: true });
    } catch (err) {
        console.log(`  ❌ LỖI: ${err.message || err.response?.data?.message || err}`);
        results.push({ name: testName, passed: false, error: err.response?.data?.message || err.message });
    }
}

// ==========================================
// 1. AUTH & SETUP
// ==========================================
async function setupUsers() {
    // 0. Connect DB
    await mongoose.connect(process.env.MONGO_URI);

    // 1. Tạo Free User
    let signUpRes = await axios.post(`${BASE_URL}/auth/signup`, { name: 'Free User', email: freeUser.email, password: freeUser.password });
    freeUser.id = signUpRes.data.data._id;
    let signIn = await axios.post(`${BASE_URL}/auth/signin`, { email: freeUser.email, password: freeUser.password });
    freeUser.cookies = signIn.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');

    // 2. Tạo Pro User (Sẽ dùng Admin để nâng cấp sau)
    signUpRes = await axios.post(`${BASE_URL}/auth/signup`, { name: 'Pro User', email: proUser.email, password: proUser.password });
    proUser.id = signUpRes.data.data._id;
    signIn = await axios.post(`${BASE_URL}/auth/signin`, { email: proUser.email, password: proUser.password });
    proUser.cookies = signIn.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
}

// ==========================================
// 2. ACCOUNT & LIMITS (FREE)
// ==========================================
async function testFreeAccountLimits() {
    const authCfg = { headers: { Cookie: freeUser.cookies } };
    
    // Tạo 3 Account thủ công trực tiếp trong DB cho freeUser.id để test vượt rào cản
    await mongoose.connection.collection('accounts').insertMany([
        { userId: new mongoose.Types.ObjectId(freeUser.id), platform: 'mock1', platformAccountName: 'm1', config: '1', createdAt: new Date() },
        { userId: new mongoose.Types.ObjectId(freeUser.id), platform: 'mock2', platformAccountName: 'm2', config: '2', createdAt: new Date() },
        { userId: new mongoose.Types.ObjectId(freeUser.id), platform: 'mock3', platformAccountName: 'm3', config: '3', createdAt: new Date() }
    ]);
    // Lấy 1 accountId để dùng tạo post (cần fake _id đúng định dạng)
    tgAccountId.free = (await mongoose.connection.collection('accounts').findOne({ userId: new mongoose.Types.ObjectId(freeUser.id) }))._id.toString();

    // Connect 4: Sẽ bị block (vì Free max 3)
    try {
        await axios.post(`${BASE_URL}/accounts/connect`, { platform: 'telegram', config: TELEGRAM_CONFIG }, authCfg);
        assert(false, "Đáng lẽ phải bị chặn giới hạn 3 account");
    } catch (err) {
        assert(err.response?.status === 403, `Phải trả về 403 Forbidden, nhận được: ${err.response?.status}`);
    }
}

// ==========================================
// 3. POST LIMITS (FREE)
// ==========================================
async function testFreePostLimits() {
    const authCfg = { headers: { Cookie: freeUser.cookies } };

    // Lỗi 1: Đăng ảnh cho gói Free -> 403
    try {
        await axios.post(`${BASE_URL}/posts`, {
            content: 'Test bài có ảnh',
            accountIds: [tgAccountId.free],
            mediaUrls: ['http://example.com/image.png']
        }, authCfg);
        assert(false, "Đáng lẽ phải bị chặn media cho Free");
    } catch (err) {
        assert(err.response?.status === 403, "Phải trả về 403 Forbidden (Media)");
    }

    // Lỗi 2: Lên lịch > 24h -> 403
    try {
        const after48h = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
        await axios.post(`${BASE_URL}/posts`, {
            content: 'Test bài > 24h',
            accountIds: [tgAccountId.free],
            scheduledAt: after48h
        }, authCfg);
        assert(false, "Đáng lẽ phải bị chặn schedule > 24h cho Free");
    } catch (err) {
        assert(err.response?.status === 403, "Phải trả về 403 Forbidden (24h schedule)");
    }

    // Lỗi 3: Queue Limit (Tạo 3 bài -> Bài 4 bị block)
    const after1h = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await axios.post(`${BASE_URL}/posts`, { content: 'Queue 1', accountIds: [tgAccountId.free], scheduledAt: after1h }, authCfg);
    await axios.post(`${BASE_URL}/posts`, { content: 'Queue 2', accountIds: [tgAccountId.free], scheduledAt: after1h }, authCfg);
    await axios.post(`${BASE_URL}/posts`, { content: 'Queue 3', accountIds: [tgAccountId.free], scheduledAt: after1h }, authCfg);

    try {
        await axios.post(`${BASE_URL}/posts`, { content: 'Queue 4', accountIds: [tgAccountId.free], scheduledAt: after1h }, authCfg);
        assert(false, "Đáng lẽ bài thứ 4 trong queue phải bị block");
    } catch (err) {
        assert(err.response?.status === 403, "Phải trả về 403 Forbidden (Queue Limit max 3)");
    }
}

// ==========================================
// 4. TRANSACTION / WEBHOOK (Nâng cấp PRO)
// ==========================================
async function testUpgradeToPro() {
    // 1. Pro User request tạo link thanh toán (đang ở gói Free ban đầu)
    const authCfg = { headers: { Cookie: proUser.cookies } };
    const payRes = await axios.post(`${BASE_URL}/transactions/create-payment`, {}, authCfg);
    assert(payRes.status === 201, "Tạo payment link phải thành công");
    
    const orderCode = payRes.data.data.transaction.orderCode;

    // 2. Gọi webhook mô phỏng thanh toán thành công
    const payload = {
        orderCode: orderCode,
        status: 'PAID'
    };

    const res = await axios.post(`${BASE_URL}/transactions/webhook`, payload);
    assert(res.status === 200, "Webhook nâng cấp PRO phải thành công");

    // Lấy lại token mới cho proUser để có payload chứa plan: 'pro'
    const signIn = await axios.post(`${BASE_URL}/auth/signin`, { email: proUser.email, password: proUser.password });
    proUser.cookies = signIn.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
}

// ==========================================
// 5. PRO USER LIMITS & ACTUAL POST (DISCORD + TG)
// ==========================================
async function testProCapabilities() {
    const authCfg = { headers: { Cookie: proUser.cookies } };

    // Connect Telegram & Discord cho PRO
    let res = await axios.post(`${BASE_URL}/accounts/connect`, { platform: 'telegram', config: TELEGRAM_CONFIG }, authCfg);
    tgAccountId.pro = res.data.data._id;
    
    res = await axios.post(`${BASE_URL}/accounts/connect`, { platform: 'discord', config: { webhookUrl: DISCORD_WEBHOOK_URL } }, authCfg);
    discordAccountId.pro = res.data.data._id;

    // Pro User tạo bài viết kèm media (Đáng lẽ phải cho qua)
    // Và đặt lịch sau 5 giây để test publish luôn
    const in5s = new Date(Date.now() + 5000).toISOString();
    const createRes = await axios.post(`${BASE_URL}/posts`, {
        content: `👑 [PRO TEST] Multi-platform text with Media - ${new Date().toLocaleTimeString()}`,
        accountIds: [tgAccountId.pro, discordAccountId.pro],
        scheduledAt: in5s,
        mediaUrls: ['https://picsum.photos/seed/protest/800/400']
    }, authCfg);
    
    assert(createRes.status === 201, "Tạo bài viết PRO phải thành công");
    const postId = createRes.data.data._id;

    console.log('  ⏳ Chờ 10 giây để Queue publish bài viết Pro đa nền tảng...');
    await new Promise(r => setTimeout(r, 10000));

    // Kiểm tra trạng thái bài đăng
    const checkRes = await axios.get(`${BASE_URL}/posts/${postId}`, authCfg);
    const post = checkRes.data.data;

    assert(post.status === 'published', `Bài viết phải ở trạng thái published, hiện tại: ${post.status}`);
    
    // Kiểm tra log discord và telegram
    const logs = post.logs || [];
    assert(logs.length === 2, "Phải có 2 logs (cho Discord và Telegram)");
    
    logs.forEach(log => {
        if (log.status !== 'success') {
            throw new Error(`Đăng bài lên ${log.platform} thất bại: ${log.errorReason}`);
        }
        console.log(`     ✅ Đã đăng thành công lên ${log.platform}`);
    });
}

// ==========================================
// 6. GENERAL VALIDATORS
// ==========================================
async function testGeneralValidators() {
    const authCfg = { headers: { Cookie: freeUser.cookies } };
    
    // Đổi mật khẩu
    try {
        await axios.put(`${BASE_URL}/users/change-password`, { oldPassword: freeUser.password, newPassword: '123' }, authCfg);
        assert(false, "Đổi mật khẩu quá ngắn phải bị chặn");
    } catch (err) {
        assert(err.response?.status === 400, "Phải trả về 400 Bad Request");
    }

    // Invalid ID param
    try {
        await axios.get(`${BASE_URL}/posts/invalid-mongo-id`, authCfg);
        assert(false, "ID không hợp lệ phải bị chặn");
    } catch (err) {
        assert(err.response?.status === 400, "Phải trả về 400 Bad Request cho invalid ID");
    }
}

// ==========================================
// EXECUTE SUITE
// ==========================================
async function runAll() {
    console.log('='.repeat(60));
    console.log('🚀 KHỞI CHẠY BỘ TEST E2E TOÀN DIỆN (FULL SYSTEM)');
    console.log('='.repeat(60));

    await runTest("Setup tài khoản Test", setupUsers);
    
    if (freeUser.cookies) {
        await runTest("Kiểm tra giới hạn Account (Free Plan max 3)", testFreeAccountLimits);
        await runTest("Kiểm tra giới hạn Post & Queue (Free Plan)", testFreePostLimits);
        await runTest("Kiểm tra các Validator chung (Auth/Post)", testGeneralValidators);
    }
    
    if (proUser.id) {
        await runTest("Nâng cấp User lên PRO (qua Transaction Webhook)", testUpgradeToPro);
        await runTest("Kiểm tra PRO User (Vượt Limit, Đăng Multi-platform Discord+TG thực tế)", testProCapabilities);
    }

    // Tổng kết
    console.log('\n' + '='.repeat(60));
    console.log('📋 KẾT QUẢ TỔNG HỢP');
    console.log('='.repeat(60));
    let passedCount = 0;
    results.forEach(r => {
        const icon = r.passed ? '✅' : '❌';
        console.log(`${icon} ${r.name} ${r.error ? ` - LỖI: ${r.error}` : ''}`);
        if (r.passed) passedCount++;
    });
    console.log(`\n🏆 Tổng kết: ${passedCount}/${results.length} kịch bản (Pass ${(passedCount/results.length*100).toFixed(1)}%)`);

    if (passedCount === results.length) {
        console.log('\n🎉 XUẤT SẮC! TOÀN BỘ HỆ THỐNG ĐÃ VƯỢT QUA TẤT CẢ BÀI KIỂM TRA!');
    }
    
    // Đóng db kết nối để thoát script
    await mongoose.disconnect();
}

runAll();
