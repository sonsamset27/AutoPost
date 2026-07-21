import axios from 'axios';

const BASE_URL = 'http://localhost:3027/api/v1';

async function testApis() {
    console.log("Starting API tests...");

    // 1. Auth: Sign up
    let userEmail = `testuser_${Date.now()}@test.com`;
    let userPassword = "password123";

    let signUpRes;
    try {
        signUpRes = await axios.post(`${BASE_URL}/auth/signup`, {
            name: "Test User",
            email: userEmail,
            password: userPassword
        });
        console.log("✅ Sign up success:", signUpRes.data.message);
    } catch (err) {
        console.error("❌ Sign up failed:", err.response?.data || err.message);
        return;
    }

    // 2. Auth: Sign in (we need to handle cookies for accessToken, since axios doesn't automatically save them if we don't configure a cookie jar, wait - the controller might not return the token in body!)
    // Let me check if it returns token in body. In auth.controller.js it does: res.status(200).json({ success: true, message: "Sign in successful" });
    // And sets cookie. This means for testing, we should probably read the set-cookie header.

    let signInRes;
    let cookies = "";
    try {
        signInRes = await axios.post(`${BASE_URL}/auth/signin`, {
            email: userEmail,
            password: userPassword
        });
        console.log("✅ Sign in success:", signInRes.data.message);

        // Extract cookies
        if (signInRes.headers['set-cookie']) {
            cookies = signInRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        }
    } catch (err) {
        console.error("❌ Sign in failed:", err.response?.data || err.message);
        return;
    }

    const authConfig = {
        headers: {
            Cookie: cookies
        }
    };

    // 3. User Profile
    try {
        const profileRes = await axios.get(`${BASE_URL}/users/profile`, authConfig);
        console.log("✅ Get profile success:", profileRes.data.data.email);
    } catch (err) {
        console.error("❌ Get profile failed:", err.response?.data || err.message);
    }

    // 4. Accounts: Connect Account
    let accountId = null;
    try {
        const connectRes = await axios.post(`${BASE_URL}/accounts/connect`, {
            platform: "telegram",
            config: { botToken: "fake_bot_token_123", chatId: "fake_chat_id_456" }
        }, authConfig);
        console.log("✅ Connect account success:", connectRes.data.data.platform);
        accountId = connectRes.data.data._id;
    } catch (err) {
        console.error("❌ Connect account failed:", err.response?.data || err.message);
    }

    // 5. Accounts: Get Accounts
    try {
        const getAccRes = await axios.get(`${BASE_URL}/accounts`, authConfig);
        console.log("✅ Get accounts success, total:", getAccRes.data.data.length);
    } catch (err) {
        console.error("❌ Get accounts failed:", err.response?.data || err.message);
    }

    // 6. Posts: Create Post
    let postId = null;
    try {
        const createPostRes = await axios.post(`${BASE_URL}/posts`, {
            content: "Hello World",
            accountIds: accountId ? [accountId] : []
        }, authConfig);
        console.log("✅ Create post success, status:", createPostRes.data.data.status);
        postId = createPostRes.data.data._id;
    } catch (err) {
        console.error("❌ Create post failed:", err.response?.data || err.message);
    }

    if (postId) {
        // 7. Posts: Get Posts
        try {
            const getPostsRes = await axios.get(`${BASE_URL}/posts`, authConfig);
            console.log("✅ Get posts success, total:", getPostsRes.data.data.length);
        } catch (err) {
            console.error("❌ Get posts failed:", err.response?.data || err.message);
        }

        // 8. Posts: Get Post by ID
        try {
            const getPostByIdRes = await axios.get(`${BASE_URL}/posts/${postId}`, authConfig);
            console.log("✅ Get post by id success:", getPostByIdRes.data.data.content);
        } catch (err) {
            console.error("❌ Get post by id failed:", err.response?.data || err.message);
        }

        // 9. Posts: Update Post
        try {
            const updatePostRes = await axios.put(`${BASE_URL}/posts/${postId}`, {
                content: "Updated Hello World"
            }, authConfig);
            console.log("✅ Update post success:", updatePostRes.data.data.content);
        } catch (err) {
            console.error("❌ Update post failed:", err.response?.data || err.message);
        }

        // 10. Posts: Delete Post
        try {
            const deletePostRes = await axios.delete(`${BASE_URL}/posts/${postId}`, authConfig);
            console.log("✅ Delete post success:", deletePostRes.data.message);
        } catch (err) {
            console.error("❌ Delete post failed:", err.response?.data || err.message);
        }
    }

    // 11. Accounts: Update Account
    if (accountId) {
        try {
            const updateAccRes = await axios.put(`${BASE_URL}/accounts/${accountId}`, {
                isActive: false
            }, authConfig);
            console.log("✅ Update account success, isActive:", updateAccRes.data.data.isActive);
        } catch (err) {
            console.error("❌ Update account failed:", err.response?.data || err.message);
        }

        // 12. Accounts: Disconnect Account
        try {
            const delAccRes = await axios.delete(`${BASE_URL}/accounts/${accountId}`, authConfig);
            console.log("✅ Disconnect account success:", delAccRes.data.message);
        } catch (err) {
            console.error("❌ Disconnect account failed:", err.response?.data || err.message);
        }
    }

    // 13. Auth: Refresh
    try {
        const refreshRes = await axios.post(`${BASE_URL}/auth/refresh`, {}, authConfig);
        console.log("✅ Refresh success:", refreshRes.data.message);
        if (refreshRes.headers['set-cookie']) {
            cookies = refreshRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
            authConfig.headers.Cookie = cookies;
        }
    } catch (err) {
        console.error("❌ Refresh failed:", err.response?.data || err.message);
    }

    // 15. User: Change Password
    try {
        const changePassRes = await axios.put(`${BASE_URL}/users/change-password`, {
            oldPassword: "password123",
            newPassword: "password1234"
        }, authConfig);
        console.log("✅ Change password success:", changePassRes.data.message);
    } catch (err) {
        console.error("❌ Change password failed:", err.response?.data || err.message);
    }

    // 16. Admin: Get Users (Expected to fail with 403 because role is user)
    try {
        const adminUsersRes = await axios.get(`${BASE_URL}/admin/users`, authConfig);
        console.log("✅ Admin get users success (UNEXPECTED):", adminUsersRes.data);
    } catch (err) {
        if (err.response?.status === 403) {
            console.log("✅ Admin get users correctly forbidden for normal user");
        } else {
            console.error("❌ Admin get users failed unexpectedly:", err.response?.data || err.message);
        }
    }

    // 17. Payment: Create Payment
    let orderCode = null;
    try {
        const createPaymentRes = await axios.post(`${BASE_URL}/transactions/create-payment`, {}, authConfig);
        console.log("✅ Create payment success:", createPaymentRes.data.data.checkoutUrl);
        // Extract orderCode from checkoutUrl for testing webhook
        orderCode = createPaymentRes.data.data.transaction.orderCode;
    } catch (err) {
        console.error("❌ Create payment failed:", err.response?.data || err.message);
    }

    // 18. Payment: Webhook Mock
    if (orderCode) {
        try {
            const webhookRes = await axios.post(`${BASE_URL}/transactions/webhook`, {
                orderCode,
                status: "PAID"
            });
            console.log("✅ Webhook processed success:", webhookRes.data.message);

            // Verify plan upgraded
            const profileRes = await axios.get(`${BASE_URL}/users/profile`, authConfig);
            if (profileRes.data.data.plan === 'pro') {
                console.log("✅ Plan upgraded to pro successfully!");
            } else {
                console.error("❌ Plan was not upgraded to pro");
            }
        } catch (err) {
            console.error("❌ Webhook failed:", err.response?.data || err.message);
        }
    }

    // 14. Auth: Logout
    try {
        const logoutRes = await axios.post(`${BASE_URL}/auth/logout`, {}, authConfig);
        console.log("✅ Logout success:", logoutRes.data.message);
    } catch (err) {
        console.error("❌ Logout failed:", err.response?.data || err.message);
    }

    console.log("API tests completed.");
}

testApis();
