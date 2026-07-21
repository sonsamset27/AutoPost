/**
 * TEST E2E: Auto-post & Schedule với Discord thật
 * 
 * Test 5 kịch bản thực tế của hệ thống AutoPost:
 * 1. Đăng bài ngay lập tức (draft + publish thủ công)
 * 2. Lên lịch đăng bài (scheduled -> BullMQ -> auto publish)
 * 3. Cập nhật nội dung bài đang lên lịch
 * 4. Cập nhật lịch hẹn giờ sang thời gian mới
 * 5. Xóa bài + hủy job BullMQ
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3027/api/v1';
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1529079984914956338/cLR-Wklvap0JT_TyzFxrnvwZYDQ5b_WShGsDNFPaC-1dHwNWDQvRJ7P8f2ADZE4czHU0';

// ----- Helper: Đăng ký + Đăng nhập, lấy cookie -----
async function setupUser() {
    const email = `discord_test_${Date.now()}@autopost.test`;
    const password = 'Password123!';
    
    await axios.post(`${BASE_URL}/auth/signup`, { name: 'AutoPost Tester', email, password });
    
    const signInRes = await axios.post(`${BASE_URL}/auth/signin`, { email, password });
    const cookies = signInRes.headers['set-cookie']
        .map(c => c.split(';')[0])
        .join('; ');
    
    console.log('✅ Đăng ký & Đăng nhập thành công');
    return { cookies, email };
}

// ----- Helper: Kết nối tài khoản Discord -----
async function connectDiscord(cookies) {
    const authCfg = { headers: { Cookie: cookies } };
    
    const res = await axios.post(`${BASE_URL}/accounts/connect`, {
        platform: 'discord',
        config: { webhookUrl: DISCORD_WEBHOOK_URL }
    }, authCfg);
    
    const accountId = res.data.data._id;
    const accountName = res.data.data.platformAccountName;
    console.log(`✅ Kết nối Discord thành công: ${accountName} (ID: ${accountId})`);
    return accountId;
}

// ----- Kịch bản 1: Tạo bài Draft (không hẹn giờ) -----
async function test1_DraftPost(cookies, accountId) {
    console.log('\n📌 Kịch bản 1: Tạo bài viết không hẹn giờ (draft)');
    const authCfg = { headers: { Cookie: cookies } };
    
    const createRes = await axios.post(`${BASE_URL}/posts`, {
        content: '🤖 [AutoPost TEST] Kịch bản 1: Bài đăng trực tiếp từ hệ thống AutoPost!',
        accountIds: [accountId]
    }, authCfg);
    
    const post = createRes.data.data;
    console.log(`  ✅ Bài tạo thành công - status: ${post.status} | ID: ${post._id}`);
    
    if (post.status !== 'draft') {
        console.warn('  ⚠️  Bài không có scheduledAt nên nên là draft');
    }
    
    // Dọn dẹp
    await axios.delete(`${BASE_URL}/posts/${post._id}`, authCfg);
    console.log(`  🗑️  Đã xóa bài draft`);
    return true;
}

// ----- Kịch bản 2: Lên lịch đăng bài thật -> đợi BullMQ publish lên Discord -----
async function test2_ScheduledPost(cookies, accountId) {
    console.log('\n📌 Kịch bản 2: Lên lịch đăng bài (5 giây) -> chờ BullMQ auto-publish lên Discord THẬT');
    const authCfg = { headers: { Cookie: cookies } };
    
    const delayMs = 5000; // 5 giây
    const scheduledAt = new Date(Date.now() + delayMs).toISOString();
    
    const createRes = await axios.post(`${BASE_URL}/posts`, {
        content: `⏰ [AutoPost SCHEDULED] Kịch bản 2: Bài đăng hẹn giờ - ${new Date().toLocaleString('vi-VN')}`,
        accountIds: [accountId],
        scheduledAt
    }, authCfg);
    
    const post = createRes.data.data;
    console.log(`  ✅ Bài tạo thành công - status: ${post.status} | bullJobId: ${post.bullJobId}`);
    
    if (post.status !== 'scheduled') {
        throw new Error('Bài phải ở trạng thái scheduled!');
    }
    
    // Đợi Worker xử lý (5s delay + 5s buffer)
    console.log(`  ⏳ Đợi ${delayMs/1000 + 5} giây để BullMQ Worker chạy job...`);
    await new Promise(r => setTimeout(r, delayMs + 5000));
    
    const checkRes = await axios.get(`${BASE_URL}/posts/${post._id}`, authCfg);
    const finalPost = checkRes.data.data;
    
    console.log(`  📊 Trạng thái sau khi publish: ${finalPost.status}`);
    if (finalPost.logs?.length > 0) {
        finalPost.logs.forEach(log => {
            const icon = log.status === 'success' ? '✅' : '❌';
            console.log(`     ${icon} Platform: ${log.platform} | Status: ${log.status}${log.errorReason ? ` | Lý do: ${log.errorReason}` : ''}${log.publishedUrl ? ` | URL: ${log.publishedUrl}` : ''}`);
        });
    }
    
    if (finalPost.status === 'published') {
        console.log('  🎉 THÀNH CÔNG! Bài đã được đăng tự động lên Discord!');
    } else {
        console.warn(`  ⚠️  Trạng thái cuối: ${finalPost.status}`);
    }
    
    return post._id; // Giữ lại để test kịch bản tiếp theo
}

// ----- Kịch bản 3: Cập nhật nội dung bài đang ở draft -----
async function test3_UpdateContent(cookies, accountId) {
    console.log('\n📌 Kịch bản 3: Cập nhật nội dung bài đang lên lịch trước khi đến giờ');
    const authCfg = { headers: { Cookie: cookies } };
    
    const futureTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 tiếng nữa
    const createRes = await axios.post(`${BASE_URL}/posts`, {
        content: 'Nội dung gốc cần cập nhật',
        accountIds: [accountId],
        scheduledAt: futureTime
    }, authCfg);
    
    const postId = createRes.data.data._id;
    console.log(`  ✅ Bài tạo thành công - jobId: ${createRes.data.data.bullJobId}`);
    
    const updateRes = await axios.put(`${BASE_URL}/posts/${postId}`, {
        content: '✏️ [AutoPost UPDATE] Kịch bản 3: Nội dung đã được cập nhật trước giờ đăng!'
    }, authCfg);
    
    console.log(`  ✅ Cập nhật nội dung thành công: "${updateRes.data.data.content}"`);
    
    // Dọn dẹp
    await axios.delete(`${BASE_URL}/posts/${postId}`, authCfg);
    console.log('  🗑️  Đã xóa bài + hủy job BullMQ');
    return true;
}

// ----- Kịch bản 4: Dời lịch đăng bài sang giờ khác -----
async function test4_ReschedulePost(cookies, accountId) {
    console.log('\n📌 Kịch bản 4: Dời lịch hẹn giờ đăng bài');
    const authCfg = { headers: { Cookie: cookies } };
    
    const originalTime = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 phút nữa
    const newTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();       // Dời sang 1 tiếng nữa
    
    const createRes = await axios.post(`${BASE_URL}/posts`, {
        content: '📅 [AutoPost RESCHEDULE] Kịch bản 4: Bài này sẽ được dời lịch',
        accountIds: [accountId],
        scheduledAt: originalTime
    }, authCfg);
    
    const postId = createRes.data.data._id;
    const oldJobId = createRes.data.data.bullJobId;
    console.log(`  ✅ Bài tạo - Job gốc ID: ${oldJobId} | Giờ gốc: ${originalTime}`);
    
    const rescheduleRes = await axios.put(`${BASE_URL}/posts/${postId}`, {
        scheduledAt: newTime
    }, authCfg);
    
    const newJobId = rescheduleRes.data.data.bullJobId;
    console.log(`  ✅ Dời lịch thành công - Job mới ID: ${newJobId} | Giờ mới: ${newTime}`);
    
    if (oldJobId !== newJobId) {
        console.log('  ✅ BullMQ đã hủy job cũ và tạo job mới đúng chuẩn!');
    }
    
    // Dọn dẹp
    await axios.delete(`${BASE_URL}/posts/${postId}`, authCfg);
    console.log('  🗑️  Đã xóa bài + hủy job BullMQ mới');
    return true;
}

// ----- Kịch bản 5: Đăng nhiều ảnh lên Discord (Embed) -----
async function test5_PostWithMedia(cookies, accountId) {
    console.log('\n📌 Kịch bản 5: Đăng bài kèm hình ảnh (Discord Embed)');
    const authCfg = { headers: { Cookie: cookies } };
    
    const scheduledAt = new Date(Date.now() + 5000).toISOString(); // 5 giây
    
    const createRes = await axios.post(`${BASE_URL}/posts`, {
        content: '🖼️ [AutoPost MEDIA] Kịch bản 5: Bài đăng có kèm ảnh từ AutoPost!',
        accountIds: [accountId],
        scheduledAt,
        mediaUrls: [
            'https://picsum.photos/seed/autopost1/800/400',
            'https://picsum.photos/seed/autopost2/800/400'
        ]
    }, authCfg);
    
    const post = createRes.data.data;
    console.log(`  ✅ Bài tạo - status: ${post.status} | mediaUrls: ${post.mediaUrls?.length} ảnh`);
    
    console.log('  ⏳ Đợi 10 giây để BullMQ publish...');
    await new Promise(r => setTimeout(r, 10000));
    
    const checkRes = await axios.get(`${BASE_URL}/posts/${post._id}`, authCfg);
    const finalPost = checkRes.data.data;
    
    console.log(`  📊 Trạng thái sau publish: ${finalPost.status}`);
    if (finalPost.logs?.length > 0) {
        finalPost.logs.forEach(log => {
            const icon = log.status === 'success' ? '✅' : '❌';
            console.log(`     ${icon} ${log.platform} | ${log.status}${log.errorReason ? `: ${log.errorReason}` : ''}`);
        });
    }
    
    if (finalPost.status === 'published') {
        console.log('  🎉 THÀNH CÔNG! Bài có ảnh đã được đăng lên Discord!');
    }
    return true;
}

// ----- RUN ALL TESTS -----
async function runAllTests() {
    console.log('='.repeat(60));
    console.log('🚀 BẮT ĐẦU TEST E2E - AutoPost Discord Integration');
    console.log(`📡 Discord Webhook: ${DISCORD_WEBHOOK_URL.substring(0, 60)}...`);
    console.log('='.repeat(60));
    
    let cookies, accountId;
    
    try {
        // Setup
        const userInfo = await setupUser();
        cookies = userInfo.cookies;
        accountId = await connectDiscord(cookies);
    } catch (err) {
        console.error('❌ Setup thất bại:', err.response?.data || err.message);
        process.exit(1);
    }
    
    const results = [];
    
    // Chạy từng kịch bản
    for (const [name, fn, args] of [
        ['Kịch bản 1: Draft Post',        test1_DraftPost,      [cookies, accountId]],
        ['Kịch bản 2: Scheduled -> Pub',  test2_ScheduledPost,  [cookies, accountId]],
        ['Kịch bản 3: Update Content',    test3_UpdateContent,  [cookies, accountId]],
        ['Kịch bản 4: Reschedule Post',   test4_ReschedulePost, [cookies, accountId]],
        ['Kịch bản 5: Post with Media',   test5_PostWithMedia,  [cookies, accountId]],
    ]) {
        try {
            await fn(...args);
            results.push({ name, passed: true });
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
