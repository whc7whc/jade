const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

// 處理登入/註冊按鈕點擊
document.addEventListener("DOMContentLoaded", () => {
  const clientId =
    "905313427248-c4b1b5hbav0ecu2c0f4rnvdi373er4ih.apps.googleusercontent.com";

  function handleCredentialResponse(response, action) {
    const id_token = response.credential;

    fetch("http://localhost:5000/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: id_token,
        action: action, // 'register' 或 'login'
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("後端回應:", data);
        // TODO: 根據情況導向頁面或顯示訊息
      })
      .catch((err) => {
        console.error("API錯誤:", err);
      });
  }

  // 先初始化，只做一次
  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      // 這裡需要知道是註冊或登入，建議用全域變數存 action
      if (window.googleLoginAction) {
        handleCredentialResponse(response, window.googleLoginAction);
        window.googleLoginAction = null; // 用完清空
      } else {
        console.warn("未指定 action");
      }
    },
  });

  // 按鈕事件只設定 action 並叫 prompt
  document.getElementById("google-register").addEventListener("click", (e) => {
    e.preventDefault();
    window.googleLoginAction = "register"; // 註冊
    google.accounts.id.prompt();
  });

  document.getElementById("google-login").addEventListener("click", (e) => {
    e.preventDefault();
    window.googleLoginAction = "login"; // 登入
    google.accounts.id.prompt();
  });
});

//寄送驗證碼

function startCooldown(seconds = 60) {
  const btn = document.getElementById("send-code-btn");
  let timeLeft = seconds;

  btn.disabled = true;

  const interval = setInterval(() => {
    btn.textContent = `請稍候(${timeLeft}s)`;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(interval);
      btn.disabled = false;
      btn.textContent = "寄送驗證碼";
    }
  }, 1000);
}

// 呼叫後端寄送驗證碼
document.addEventListener("DOMContentLoaded", () => {
  const sendCodeBtn = document.getElementById("send-code-btn");

  sendCodeBtn.addEventListener("click", async () => {
    const emailInput = document.querySelector(
      '.signup-form input[type="email"]'
    );
    const email = emailInput?.value?.trim();

    if (!email) {
      alert("請輸入 Email");
      return;
    }

    try {
      // 呼叫後端寄送驗證碼的 API
      const response = await fetch(
        `${API_BASE_URL}/api/auth/send-verification-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("驗證碼已寄送到信箱，請查看您的 Email");
        startCooldown(); // 開始倒數
      } else {
        alert(result.message || "寄送失敗，請稍後再試");
      }
    } catch (error) {
      console.error("寄送驗證碼錯誤:", error);
      alert("無法連線伺服器，請稍後再試");
    }
  });

  // 冷卻倒數功能，防止短時間重複點擊
  function startCooldown(seconds = 60) {
    const btn = document.getElementById("send-code-btn");
    let timeLeft = seconds;

    btn.disabled = true;

    const interval = setInterval(() => {
      btn.textContent = `請稍候 (${timeLeft}s)`;
      timeLeft--;

      if (timeLeft < 0) {
        clearInterval(interval);
        btn.disabled = false;
        btn.textContent = "寄送驗證碼";
      }
    }, 1000);
  }
});
