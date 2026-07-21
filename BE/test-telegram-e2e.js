/**
 * TEST E2E: AutoPost Telegram Integration + Validator Coverage
 * 
 * Test 7 kịch bản:
 * 1. Đăng bài trực tiếp lên Telegram (scheduled -> auto publish)
 * 2. Đăng bài kèm ảnh lên Telegram
 * 3. Đăng bài đồng thời lên Discord + Telegram (multi-platform)
 * 4. Validator: Tạo bài thiếu content → 400
 * 5. Validator: Tạo bài thiếu accountIds → 400
 * 6. Validator: scheduledAt ở quá khứ → 400
 * 7. Validator: Invalid post ID → 400
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3027/api/v1';
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1529079984914956338/cLR-Wklvap0JT_TyzFxrnvwZYDQ5b_WShGsDNFPaC-1dHwNWDQvRJ7P8f2ADZE4czHU0';
const TELEGRAM_CONFIG = {
    botToken: '8856059550:AAFSK2joqJLuC2PC2ItYLxii2xZLiu2WvyI',
    chatId: '-1002203514094'
};

// ----- Helper -----
async function setupUser() {
    const email = `tg_test_${Date.now()}@autopost.test`;
    const password = 'Password123!';
    
    await axios.post(`${BASE_URL}/auth/signup`, { name: 'Telegram Tester', email, password });
    
    const signInRes = await axios.post(`${BASE_URL}/auth/signin`, { email, password });
    const cookies = signInRes.headers['set-cookie']
        .map(c => c.split(';')[0])
        .join('; ');
    
    console.log('✅ Đăng ký & Đăng nhập thành công');
    return { cookies, email };
}

async function connectPlatform(cookies, platform, config) {
    const authCfg = { headers: { Cookie: cookies } };
    const res = await axios.post(`${BASE_URL}/accounts/connect`, { platform, config }, authCfg);
    const accountId = res.data.data._id;
    console.log(`✅ Kết nối ${platform} thành công: ${res.data.data.platformAccountName} (ID: ${accountId})`);
    return accountId;
}

// ===== KỊCH BẢN 1: Lên lịch đăng bài text lên Telegram =====
async function test1_TelegramScheduledPost(cookies, tgAccountId) {
    console.log('\n📌 KB1: Lên lịch đăng bài text lên Telegram (5 giây)');
    const authCfg = { headers: { Cookie: cookies } };
    
    const scheduledAt = new Date(Date.now() + 5000).toISOString();
    const createRes = await axios.post(`${BASE_URL}/posts`, {
        content: `📨 [AutoPost TG] KB1: Bài text hẹn giờ - ${new Date().toLocaleString('vi-VN')}`,
        accountIds: [tgAccountId],
        scheduledAt
    }, authCfg);
    
    const post = createRes.data.data;
    console.log(`  ✅ Bài tạo - status: ${post.status} | bullJobId: ${post.bullJobId}`);
    
    console.log('  ⏳ Đợi 10 giây để BullMQ publish...');
    await new Promise(r => setTimeout(r, 10000));
    
    const checkRes = await axios.get(`${BASE_URL}/posts/${post._id}`, authCfg);
    const finalPost = checkRes.data.data;
    
    console.log(`  📊 Trạng thái: ${finalPost.status}`);
    finalPost.logs?.forEach(log => {
        const icon = log.status === 'success' ? '✅' : '❌';
        console.log(`     ${icon} ${log.platform} | ${log.status}${log.errorReason ? `: ${log.errorReason}` : ''}`);
    });
    
    if (finalPost.status === 'published') {
        console.log('  🎉 THÀNH CÔNG! Bài text đã đăng lên Telegram!');
    }
    return true;
}

// ===== KỊCH BẢN 2: Đăng bài kèm ảnh lên Telegram =====
async function test2_TelegramWithMedia(cookies, tgAccountId) {
    console.log('\n📌 KB2: Đăng bài kèm ảnh lên Telegram');
    const authCfg = { headers: { Cookie: cookies } };
    
    const scheduledAt = new Date(Date.now() + 5000).toISOString();
    const createRes = await axios.post(`${BASE_URL}/posts`, {
        content: '🖼️ [AutoPost TG] KB2: Bài có ảnh từ Telegram!',
        accountIds: [tgAccountId],
        scheduledAt,
        mediaUrls: ['https://picsum.photos/seed/telegram1/800/400']
    }, authCfg);
    
    const post = createRes.data.data;
    console.log(`  ✅ Bài tạo - mediaUrls: ${post.mediaUrls?.length} ảnh`);
    
    console.log('  ⏳ Đợi 10 giây...');
    await new Promise(r => setTimeout(r, 10000));
    
    const checkRes = await axios.get(`${BASE_URL}/posts/${post._id}`, authCfg);
    const finalPost = checkRes.data.data;
    
    console.log(`  📊 Trạng thái: ${finalPost.status}`);
    finalPost.logs?.forEach(log => {
        const icon = log.status === 'success' ? '✅' : '❌';
        console.log(`     ${icon} ${log.platform} | ${log.status}`);
    });
    
    if (finalPost.status === 'published') {
        console.log('  🎉 THÀNH CÔNG! Bài ảnh đã đăng lên Telegram!');
    }
    return true;
}

// ===== KỊCH BẢN 3: Multi-platform Discord + Telegram =====
async function test3_MultiPlatform(cookies, discordId, tgId) {
    console.log('\n📌 KB3: Đăng bài đồng thời lên Discord + Telegram (multi-platform)');
    const authCfg = { headers: { Cookie: cookies } };
    
    const scheduledAt = new Date(Date.now() + 5000).toISOString();
    const createRes = await axios.post(`${BASE_URL}/posts`, {
        content: `🌐 [AutoPost MULTI] KB3: Bài đa nền tảng - ${new Date().toLocaleString('vi-VN')}`,
        accountIds: [discordId, tgId],
        scheduledAt
    }, authCfg);
    
    const post = createRes.data.data;
    console.log(`  ✅ Bài tạo cho ${post.accountIds.length} tài khoản`);
    
    console.log('  ⏳ Đợi 10 giây...');
    await new Promise(r => setTimeout(r, 10000));
    
    const checkRes = await axios.get(`${BASE_URL}/posts/${post._id}`, authCfg);
    const finalPost = checkRes.data.data;
    
    console.log(`  📊 Trạng thái: ${finalPost.status}`);
    let allSuccess = true;
    finalPost.logs?.forEach(log => {
        const icon = log.status === 'success' ? '✅' : '❌';
        console.log(`     ${icon} ${log.platform} | ${log.status}${log.errorReason ? `: ${log.errorReason}` : ''}`);
        if (log.status !== 'success') allSuccess = false;
    });
    
    if (allSuccess && finalPost.status === 'published') {
        console.log('  🎉 THÀNH CÔNG! Bài đã đăng lên cả Discord và Telegram!');
    }
    return true;
}

// ===== KỊCH BẢN 4: Validator - thiếu content =====
async function test4_ValidatorMissingContent(cookies, tgAccountId) {
    console.log('\n📌 KB4: Validator - Tạo bài thiếu content → expect 400');
    const authCfg = { headers: { Cookie: cookies } };
    
    try {
        await axios.post(`${BASE_URL}/posts`, {
            accountIds: [tgAccountId]
            // Không có content
        }, authCfg);
        console.log('  ❌ THẤT BẠI: Server đáng lẽ phải trả 400');
        return false;
    } catch (err) {
        if (err.response?.status === 400) {
            console.log(`  ✅ Đúng! Server trả 400: "${err.response.data.message}"`);
            return true;
        }
        throw err;
    }
}

// ===== KỊCH BẢN 5: Validator - thiếu accountIds =====
async function test5_ValidatorMissingAccountIds(cookies) {
    console.log('\n📌 KB5: Validator - Tạo bài thiếu accountIds → expect 400');
    const authCfg = { headers: { Cookie: cookies } };
    
    try {
        await axios.post(`${BASE_URL}/posts`, {
            content: 'Test content'
            // Không có accountIds
        }, authCfg);
        console.log('  ❌ THẤT BẠI: Server đáng lẽ phải trả 400');
        return false;
    } catch (err) {
        if (err.response?.status === 400) {
            console.log(`  ✅ Đúng! Server trả 400: "${err.response.data.message}"`);
            return true;
        }
        throw err;
    }
}

// ===== KỊCH BẢN 6: Validator - scheduledAt ở quá khứ =====
async function test6_ValidatorPastSchedule(cookies, tgAccountId) {
    console.log('\n📌 KB6: Validator - scheduledAt ở quá khứ → expect 400');
    const authCfg = { headers: { Cookie: cookies } };
    
    try {
        await axios.post(`${BASE_URL}/posts`, {
            content: 'Test content',
            accountIds: [tgAccountId],
            scheduledAt: new Date(Date.now() - 60000).toISOString() // 1 phút trước
        }, authCfg);
        console.log('  ❌ THẤT BẠI: Server đáng lẽ phải trả 400');
        return false;
    } catch (err) {
        if (err.response?.status === 400) {
            console.log(`  ✅ Đúng! Server trả 400: "${err.response.data.message}"`);
            return true;
        }
        throw err;
    }
}

// ===== KỊCH BẢN 7: Validator - Invalid post ID =====
async function test7_ValidatorInvalidPostId(cookies) {
    console.log('\n📌 KB7: Validator - GET bài với ID không hợp lệ → expect 400');
    const authCfg = { headers: { Cookie: cookies } };
    
    try {
        await axios.get(`${BASE_URL}/posts/invalid-id-here`, authCfg);
        console.log('  ❌ THẤT BẠI: Server đáng lẽ phải trả 400');
        return false;
    } catch (err) {
        if (err.response?.status === 400) {
            console.log(`  ✅ Đúng! Server trả 400: "${err.response.data.message}"`);
            return true;
        }
        throw err;
    }
}

// ===== RUN =====
async function runAllTests() {
    console.log('='.repeat(60));
    console.log('🚀 TEST E2E - Telegram + Validator Coverage');
    console.log('='.repeat(60));
    
    let cookies, tgAccountId, discordAccountId;
    
    try {
        const userInfo = await setupUser();
        cookies = userInfo.cookies;
        tgAccountId = await connectPlatform(cookies, 'telegram', TELEGRAM_CONFIG);
        discordAccountId = await connectPlatform(cookies, 'discord', { webhookUrl: DISCORD_WEBHOOK_URL });
    } catch (err) {
        console.error('❌ Setup thất bại:', err.response?.data || err.message);
        process.exit(1);
    }
    
    const results = [];
    
    for (const [name, fn, args] of [
        ['KB1: TG Scheduled Text',     test1_TelegramScheduledPost,      [cookies, tgAccountId]],
        ['KB2: TG With Media',         test2_TelegramWithMedia,          [cookies, tgAccountId]],
        ['KB3: Multi-platform',        test3_MultiPlatform,              [cookies, discordAccountId, tgAccountId]],
        ['KB4: Validator No Content',  test4_ValidatorMissingContent,    [cookies, tgAccountId]],
        ['KB5: Validator No Accounts', test5_ValidatorMissingAccountIds, [cookies]],
        ['KB6: Validator Past Date',   test6_ValidatorPastSchedule,      [cookies, tgAccountId]],
        ['KB7: Validator Invalid ID',  test7_ValidatorInvalidPostId,     [cookies]],
    ]) {
        try {
            const passed = await fn(...args);
            results.push({ name, passed: passed !== false });
        } catch (err) {
            console.error(`\n❌ ${name} thất bại:`, err.response?.data || err.message);
            results.push({ name, passed: false, error: err.message });
        }
    }
    
    // Logout
    try {
        await axios.post(`${BASE_URL}/auth/logout`, {}, { headers: { Cookie: cookies } });
    } catch (_) {}
    
    // Tổng kết
    console.log('\n' + '='.repeat(60));
    console.log('📋 KẾT QUẢ TỔNG HỢP');
    console.log('='.repeat(60));
    let passed = 0;
    results.forEach(r => {
        const icon = r.passed ? '✅' : '❌';
        console.log(`${icon} ${r.name}${r.error ? ` - ${r.error}` : ''}`);
        if (r.passed) passed++;
    });
    console.log(`\n🏆 Tổng: ${passed}/${results.length} kịch bản thành công`);
    
    if (passed === results.length) {
        console.log('🎉 TOÀN BỘ CÁC KỊCH BẢN ĐỀU PASS!');
    }
}

runAllTests();
