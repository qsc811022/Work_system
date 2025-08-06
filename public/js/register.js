document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');
    const loading = document.getElementById('loading');
    const messageContainer = document.getElementById('message-container');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // 密碼強度檢查
    const passwordRequirements = {
        length: document.getElementById('req-length'),
        letter: document.getElementById('req-letter'),
        number: document.getElementById('req-number')
    };

    // 註冊表單提交事件
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoadingState(true);
        clearMessages();
        
        const formData = new FormData(this);
        const data = {
            userName: formData.get('userName'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showMessage('註冊成功！請登入', 'success');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                showMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('註冊錯誤:', error);
            showMessage('註冊失敗，請稍後再試', 'error');
        } finally {
            setLoadingState(false);
        }
    });

    // 密碼輸入時檢查強度
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
        checkPasswordMatch();
    });

    // 確認密碼輸入時檢查匹配
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);

    // 設定載入狀態
    function setLoadingState(isLoading) {
        registerBtn.disabled = isLoading;
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

    // 檢查密碼強度
    function checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        let score = 0;

        // 長度檢查
        if (password.length >= 6) {
            passwordRequirements.length.classList.add('valid');
            score++;
        } else {
            passwordRequirements.length.classList.remove('valid');
        }

        // 字母檢查
        if (/[a-zA-Z]/.test(password)) {
            passwordRequirements.letter.classList.add('valid');
            score++;
        } else {
            passwordRequirements.letter.classList.remove('valid');
        }

        // 數字檢查
        if (/\d/.test(password)) {
            passwordRequirements.number.classList.add('valid');
            score++;
        } else {
            passwordRequirements.number.classList.remove('valid');
        }

        // 更新強度條
        strengthBar.className = 'strength-bar';
        if (score === 1) {
            strengthBar.classList.add('strength-weak');
        } else if (score === 2) {
            strengthBar.classList.add('strength-medium');
        } else if (score === 3) {
            strengthBar.classList.add('strength-strong');
        }
    }

    // 檢查密碼匹配
    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword && password !== confirmPassword) {
            confirmPasswordInput.setCustomValidity('密碼不相符');
            confirmPasswordInput.style.borderColor = '#e74c3c';
        } else {
            confirmPasswordInput.setCustomValidity('');
            confirmPasswordInput.style.borderColor = '#e1e5e9';
        }
    }

    // 表單驗證
    function validateForm() {
        const userName = document.getElementById('userName').value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // 基本欄位檢查
        if (!userName || !password || !confirmPassword) {
            showMessage('請填寫所有必填欄位', 'error');
            return false;
        }

        // 使用者名稱長度檢查
        if (userName.length < 3) {
            showMessage('使用者名稱至少需要3個字元', 'error');
            return false;
        }

        // 密碼長度檢查
        if (password.length < 6) {
            showMessage('密碼至少需要6個字元', 'error');
            return false;
        }

        // 密碼複雜度檢查
        if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
            showMessage('密碼必須包含至少一個字母和一個數字', 'error');
            return false;
        }

        // 密碼確認檢查
        if (password !== confirmPassword) {
            showMessage('密碼確認不相符', 'error');
            return false;
        }

        return true;
    }
});