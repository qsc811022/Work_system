document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const loading = document.getElementById('loading');
    const messageContainer = document.getElementById('message-container');

    // 登入表單提交事件
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 顯示載入狀態
        setLoadingState(true);
        clearMessages();
        
        const formData = new FormData(this);
        const data = {
            userName: formData.get('userName'),
            password: formData.get('password')
        };
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showMessage('登入成功！正在跳轉...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                showMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('登入錯誤:', error);
            showMessage('登入失敗，請稍後再試', 'error');
        } finally {
            setLoadingState(false);
        }
    });
    
    // 按下 Enter 鍵提交表單
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            loginForm.dispatchEvent(new Event('submit'));
        }
    });

    // 設定載入狀態
    function setLoadingState(isLoading) {
        loginBtn.disabled = isLoading;
        loading.style.display = isLoading ? 'block' : 'none';
    }

    // 清除訊息
    function clearMessages() {
        messageContainer.innerHTML = '';
    }

    // 顯示訊息
    function showMessage(message, type = 'error') {
        const className = type === 'success' ? 'success-message' : 'error-message';
        messageContainer.innerHTML = `<div class="${className}">${message}</div>`;
    }

    // 表單驗證
    function validateForm(data) {
        if (!data.userName || !data.password) {
            showMessage('請填寫所有欄位', 'error');
            return false;
        }
        
        if (data.userName.length < 3) {
            showMessage('使用者名稱至少需要3個字元', 'error');
            return false;
        }
        
        return true;
    }
});