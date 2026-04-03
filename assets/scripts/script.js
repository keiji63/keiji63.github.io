// ⚠️ BACKEND URL (อย่าลืมเปลี่ยน)
const BACKEND_URL = "https://miss-seven-queen-api.vercel.app";
const CACHE_KEY = "MSQ_CONTESTANTS_V3"; // ถ้าแก้ข้อมูลใน Sheet แล้วอยากให้ทุกคนเห็นทันที ให้เปลี่ยน V1 เป็น V2, V3...
const CACHE_TIME = 60 * 60 * 1000; // เก็บไว้ 1 ชั่วโมง (60 นาที * 60 วิ * 1000 มิลลิวินาที)

let currentContestantId = null;
let userProfile = null;
let lastScores = {}; // เก็บ id -> คะแนนล่าสุด (เพื่อทำ Animation ตัวเลข)
let lastRankOrder = []; // เก็บ id เรียงตามลำดับ (เพื่อเช็คว่าต้องจัดหน้าใหม่ไหม)

document.addEventListener("DOMContentLoaded", () => {
  // ==============================================
  // 🟢 โซน 1: สำหรับหน้าโหวต (index.html)
  // ==============================================
  const voteGridElement = document.getElementById("grid");

  if (voteGridElement) {
    renderGrid();
  }

  // ==============================================
  // 🏆 โซน 2: สำหรับหน้า Scoreboard (scoreboard.html)
  // ==============================================
  const podiumElement = document.getElementById("podiumArea");

  if (podiumElement) {
    loadScoreboard();
    // setInterval(loadScoreboard, 10000);
  }
});

async function renderGrid() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  grid.innerHTML = `
        <div style="
            grid-column: 1 / -1; 
            text-align: center; 
            padding: 50px 0; 
            color: white; 
            font-size: 1.2rem;">
            ⏳ กำลังโหลดรายชื่อนางงาม...
        </div>`;

  try {
    let contestants = [];
    const now = new Date().getTime();

    const cachedData = localStorage.getItem(CACHE_KEY);

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (now - timestamp < CACHE_TIME) {
        console.log("⚡ ใช้ข้อมูลจาก Cache (ไม่ต้องโหลดใหม่)");
        contestants = data;
      }
    }

    if (contestants.length === 0) {
      console.log("🔄 กำลังดึงข้อมูลใหม่จาก Google Sheet...");
      const response = await fetch(`${BACKEND_URL}/api/contestants`);
      const newData = await response.json();

      if (Array.isArray(newData) && newData.length > 0) {
        contestants = newData;
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: contestants,
            timestamp: now,
          }),
        );
      }
    }

    grid.innerHTML = "";

    if (!contestants || contestants.length === 0) {
      grid.innerHTML =
        '<div style="color:white; text-align:center;">ไม่พบข้อมูลผู้เข้าประกวด</div>';
      return;
    }

    contestants.forEach((contestant) => {
      const imgUrl =
        contestant.img && contestant.img.startsWith("http")
          ? contestant.img
          : "https://placehold.co/300x400?text=No+Image";

      // const cardHtml = `
      //           <div class="card" onclick="openVoteModal('${contestant.id}', '${contestant.name}', '${imgUrl}')">
      //               <div class="card-no">MSQ-${contestant.id}</div>
      //               <img src="${imgUrl}" class="card-img" loading="lazy" alt="${contestant.name}">
      //               <div class="card-info">
      //                   <div class="card-name">${contestant.name}</div>
      //                   <div class="card-nickname">"${contestant.nickName}"</div>
      //                   <button class="btn-vote-card">VOTE</button>
      //               </div>
      //           </div>
      //       `;
      const cardHtml = `
                <div class="card">
                    <div class="card-no">MSQ-${contestant.id}</div>
                    <img src="${imgUrl}" class="card-img" loading="lazy" alt="${contestant.name}">
                    <div class="card-info">
                        <div class="card-name">${contestant.name}</div>
                        <div class="card-nickname">"${contestant.nickName}"</div>
                        <button class="btn-vote-card">VOTE</button>
                    </div>
                </div>
            `;

      grid.innerHTML += cardHtml;
    });
  } catch (error) {
    console.error("Render Grid Error:", error);
    grid.innerHTML =
      '<div style="color:red; text-align:center;">❌ โหลดข้อมูลไม่สำเร็จ</div>';
  }
}

function openHowToVote() {
  document.getElementById("howToVoteModal").style.display = "flex";
}

function openTermsModal() {
  document.getElementById("termsModal").style.display = "flex";
}

function openVoteModal(id, name, img) {
  currentContestantId = id;

  const imgEl = document.getElementById("modalImg");
  if (imgEl) {
    imgEl.src = img;
    imgEl.style.opacity = 0;
    setTimeout(() => (imgEl.style.opacity = 1), 100);
  }

  const nameEl = document.getElementById("modalName");
  if (nameEl) nameEl.innerText = name;

  const noEl = document.getElementById("modalNo");
  if (noEl) {
    const displayId = id.toString().includes("MSQ") ? id : `MSQ-${id}`;
    noEl.innerText = displayId;
  }

  document.getElementById("slipFile").value = "";

  const label = document.getElementById("uploadLabel");
  if (label) {
    label.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> แตะเพื่อแนบสลิป';
    label.style.borderColor = "#d4af37";
    label.style.color = "#d4af37";
  }

  const status = document.getElementById("status");
  if (status) status.innerText = "";

  document.getElementById("voteModal").style.display = "flex";
}

function closeModal() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.style.display = "none";
  });
}

window.onclick = function (event) {
  if (event.target.classList.contains("modal")) {
    closeModal();
  }
};

function copyToClipboard() {
  const rawText = document.getElementById("accountNo").innerText;
  const textToCopy = rawText.replace(/-/g, "").trim();

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        showCopySuccess();
      })
      .catch((err) => {
        console.warn("Modern copy failed, trying legacy...", err);
        fallbackCopyTextToClipboard(textToCopy);
      });
  } else {
    fallbackCopyTextToClipboard(textToCopy);
  }
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  textArea.style.top = "0";

  document.body.appendChild(textArea);

  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    if (successful) {
      showCopySuccess();
    } else {
      Swal.fire({
        icon: "info",
        title: "ขออภัยค่ะ",
        text: "ไม่สามารถคัดลอกได้ กรุณาจดเลขบัญชีแทนนะคะ",
        confirmButtonColor: "#d4af37",
        confirmButtonText: "เข้าใจแล้ว",
      });
    }
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
    Swal.fire({
      icon: "info",
      title: "ขออภัยค่ะ",
      text: "ไม่สามารถคัดลอกได้ กรุณาจดเลขบัญชีแทนนะคะ",
      confirmButtonColor: "#d4af37",
      confirmButtonText: "เข้าใจแล้ว",
    });
  }

  document.body.removeChild(textArea);
}

function showCopySuccess() {
  const btn = document.querySelector(".btn-copy");
  const originalHTML = '<i class="fas fa-copy"></i> คัดลอก';

  btn.innerHTML = '<i class="fas fa-check"></i> คัดลอกแล้ว';
  btn.style.backgroundColor = "#2ecc71";
  btn.style.color = "#fff";

  setTimeout(() => {
    btn.innerHTML = originalHTML;
    btn.style.backgroundColor = "var(--gold)";
    btn.style.color = "#000";
  }, 2000);
}

function previewFile() {
  const file = document.getElementById("slipFile").files[0];
  if (file) {
    document.getElementById("uploadLabel").innerHTML =
      `<i class="fas fa-check"></i> แนบแล้ว: ${file.name.substring(0, 15)}...`;
    document.getElementById("uploadLabel").style.borderColor = "#00ff00";
    document.getElementById("uploadLabel").style.color = "#00ff00";
  }
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function submitVote() {
  const fileInput = document.getElementById("slipFile");
  const status = document.getElementById("status");
  const btn = document.getElementById("btnConfirm");

  if (!fileInput.files[0]) {
    Swal.fire({
      icon: "warning",
      title: "ยังไม่ได้แนบสลิป",
      text: "กรุณาแนบสลิปโอนเงินก่อนกดยืนยันนะคะ",
      confirmButtonColor: "#d4af37",
      confirmButtonText: "โอเค",
    });
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังตรวจสอบ...';

  const reader = new FileReader();
  reader.readAsDataURL(fileInput.files[0]);
  reader.onload = async () => {
    const base64String = reader.result.replace("data:", "").replace(/^.+,/, "");

    try {
      const response = await fetch(`${BACKEND_URL}/verify-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64String,
          contestantNo: currentContestantId,
        }),
      });
      const result = await response.json();

      if (result.success) {
        status.innerHTML = `<span style="color:#d4af37">✅ สำเร็จ! +${result.points} คะแนน</span>`;
        Swal.fire({
          icon: "success",
          title: "ขอบคุณค่ะ!",
          html: `โหวตสำเร็จ <b style="color:#d4af37; font-size: 1.2em;">+${result.points} คะแนน</b>`,
          confirmButtonColor: "#d4af37",
          confirmButtonText: "ปิดหน้าต่าง",
        }).then(() => {
          closeModal();
          resetUI();
        });
      } else {
        status.innerHTML = `<span style="color:red">${result.message}</span>`;
        btn.innerHTML = '<i class="fas fa-heart"></i> โหวตให้คนนี้';
        resetUI();
      }
    } catch (err) {
      status.innerText = "เกิดข้อผิดพลาดในการเชื่อมต่อ";
      btn.innerHTML = '<i class="fas fa-heart"></i> โหวตให้คนนี้';
    } finally {
      btn.disabled = false;
    }
  };
}

async function loadScoreboard() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/leaderboard`);
    const data = await response.json();

    const currentRankOrder = data.map((p) => p.id);
    const isOrderChanged =
      JSON.stringify(currentRankOrder) !== JSON.stringify(lastRankOrder);

    const podiumEl = document.getElementById("podiumArea");
    const listEl = document.getElementById("listArea");

    if (isOrderChanged || podiumEl.innerHTML === "") {
      let podiumHtml = "";
      let listHtml = "";

      lastRankOrder = currentRankOrder;

      data.forEach((person, index) => {
        const rank = index + 1;
        // เช็ครูป ถ้าไม่มีใช้ Placeholder
        const imgUrl =
          person.img && person.img !== ""
            ? person.img
            : "https://placehold.co/150x200?text=No+Img"; // ปรับขนาด placeholder เป็นแนวตั้ง

        const startScore = lastScores[person.id] || 0;

        // --- ส่วน Podium (1-3) ---
        if (rank <= 3) {
          // มงกุฎเฉพาะที่ 1
          let crownHtml =
            rank === 1
              ? '<div class="crown-icon"><i class="fas fa-crown"></i></div>'
              : "";

          podiumHtml += `
            <div class="podium-item podium-rank-${rank}" id="contestant-${
              person.id
            }">
                ${crownHtml}
                
                <div class="photo-frame">
                    <div class="rank-badge">${rank}</div>
                    <img src="${imgUrl}" class="contestant-img" alt="Rank ${rank}">
                </div>

                <div class="score-box">
                    <div class="contestant-name">${person.name}</div>
                    <div class="score-val" id="score-${
                      person.id
                    }">${formatNumber(startScore)}</div>
                </div>
            </div>
          `;
        }
        // --- ส่วน List (4 เป็นต้นไป) ---
        else {
          listHtml += `
            <div class="list-item" id="contestant-${person.id}">
                <div class="list-rank">${rank}</div>
                <img src="${imgUrl}" class="list-img">
                <div class="list-info">
                    <div class="list-name">${person.name}</div>
                </div>
                <div class="list-score" id="score-${person.id}">${formatNumber(
                  startScore,
                )}</div>
            </div>
          `;
        }
      });

      podiumEl.innerHTML = podiumHtml;
      listEl.innerHTML = listHtml;

      // สั่ง Animation ตัวเลข (รอบแรก หรือรอบที่ลำดับเปลี่ยน)
      data.forEach((person) => {
        const startScore = lastScores[person.id] || 0;
        animateValue(`score-${person.id}`, startScore, person.score, 1500);
      });
    } else {
      // ⚡ กรณีลำดับไม่เปลี่ยน: อัปเดตแค่ตัวเลข (ไม่เรนเดอร์ HTML ใหม่)
      data.forEach((person) => {
        const startScore = lastScores[person.id] || 0;
        if (startScore !== person.score) {
          animateValue(`score-${person.id}`, startScore, person.score, 1000);
        }
      });
    }

    // บันทึกคะแนนล่าสุดไว้เทียบรอบหน้า
    data.forEach((p) => (lastScores[p.id] = p.score));
  } catch (error) {
    console.error("Load Error:", error);
    // podiumEl.innerHTML = '<div style="color:red; width:100%; text-align:center;">โหลดไม่สำเร็จ</div>';
  }
}

function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;

  if (start === end) {
    obj.innerHTML = formatNumber(end);
    return;
  }

  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);

    const current = Math.floor(progress * (end - start) + start);
    obj.innerHTML = formatNumber(current);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = formatNumber(end);
    }
  };

  window.requestAnimationFrame(step);
}

function resetUI() {
  const fileInput = document.getElementById("slipFile");
  if (fileInput) {
    fileInput.value = "";
  }

  const label = document.getElementById("uploadLabel");
  if (label) {
    label.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> แตะเพื่อแนบสลิป';

    label.style.borderColor = "";
    label.style.color = "";
  }

  const submitBtn = document.getElementById("btnConfirm");
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-heart"></i> โหวตให้คนนี้';
  }
}

function contactAdmin() {
  Swal.fire({
    icon: "info",
    title: "ติดต่อแอดมิน",
    html: 'ต้องการไปที่ Facebook Page:<br><b style="font-size: 1.1em;">Miss Seven Queen</b> หรือไม่?',
    showCancelButton: true,
    confirmButtonColor: "#d4af37",
    cancelButtonColor: "#333",
    confirmButtonText: "ไปที่ Facebook",
    cancelButtonText: "ยกเลิก",
  }).then((result) => {
    if (result.isConfirmed) {
      window.open(
        "https://m.me/misssevenqueen?openExternalBrowser=1",
        "_blank",
      );
    }
  });
}
