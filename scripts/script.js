const contestants = [
  {
    id: "01",
    name: "ธิตินาฎ หลวงราษฎร์",
    nickname: "เกรท",
    img: "https://placehold.co/300x400?text=No.1+Great",
  },
  {
    id: "02",
    name: "สิรีธร โสธร",
    nickname: "อองออล",
    img: "https://placehold.co/300x400?text=No.2+Aong-all",
  },
  {
    id: "03",
    name: "กชพร ฮอพคินส์",
    nickname: "เจนนี่",
    img: "https://placehold.co/300x400?text=No.3+Jenny",
  },
  {
    id: "04",
    name: "นฤภร ยุทธนา",
    nickname: "พี",
    img: "https://placehold.co/300x400?text=No.4+P",
  },
  {
    id: "05",
    name: "อัจฉราฉวี ใจช่วง",
    nickname: "มิ้น",
    img: "https://placehold.co/300x400?text=No.5+Mint",
  },
  {
    id: "06",
    name: "เกตน์นิภา สุจริตกุล",
    nickname: "มายด์",
    img: "https://placehold.co/300x400?text=No.6+Mind",
  },
  {
    id: "07",
    name: "ปลายฟ้า ทองดอนพุ่ม",
    nickname: "ปลายฟ้า",
    img: "https://placehold.co/300x400?text=No.7+Plaifah",
  },
  {
    id: "08",
    name: "พิมพ์ชนก วัฒนพงศ์เสถียร",
    nickname: "เฟิน",
    img: "https://placehold.co/300x400?text=No.8+Fern",
  },
  {
    id: "09",
    name: "ไกรกมล สารดิษฐ์",
    nickname: "ควีน",
    img: "https://placehold.co/300x400?text=No.9+Queen",
  },
  {
    id: "10",
    name: "สุกัญญา เตื่อยมา",
    nickname: "แป้ง",
    img: "https://placehold.co/300x400?text=No.10+Pang",
  },
  {
    id: "11",
    name: "ดวงหทัย พิณทอง",
    nickname: "ฟ้าใส",
    img: "https://placehold.co/300x400?text=No.11+Fahsai",
  },
  {
    id: "12",
    name: "นัยนา แซ่ลิ้ม",
    nickname: "เม",
    img: "https://placehold.co/300x400?text=No.12+May",
  },
  {
    id: "13",
    name: "นาถฤดี วงศ์ขาว",
    nickname: "กิมหงษ์",
    img: "https://placehold.co/300x400?text=No.13+Kimhong",
  },
  {
    id: "14",
    name: "สมฤทัย วงศ์กวน",
    nickname: "หมิว",
    img: "https://placehold.co/300x400?text=No.14+Mew",
  },
  {
    id: "15",
    name: "ปารดา หังสพฤกษ์",
    nickname: "ไข่มุก",
    img: "https://placehold.co/300x400?text=No.15+Kaimook",
  },
];

// ⚠️ BACKEND URL (อย่าลืมเปลี่ยน)
const BACKEND_URL = "https://miss-seven-queen-api.vercel.app/verify-vote";
const LIFF_ID = "1660826063-Cy2t8mh6";

let currentContestantId = null;
let userProfile = null;

async function init() {
  try {
    await liff.init({ liffId: LIFF_ID });

    if (liff.isLoggedIn()) {
      userProfile = await liff.getProfile();
    } else {
      liff.login();
    }
  } catch (err) {
    console.error("LIFF Error:", err);
  }
  renderGrid();
}
init();

function renderGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = contestants
    .map(
      (c) => `
                <div class="card" onclick="openModal('${c.id}')">
                    <div class="card-no">M7Q-${c.id}</div>
                    <img src="${c.img}" class="card-img" loading="lazy">
                    <div class="card-info">
                        <div class="card-name">${c.name}</div>
                        <div class="card-nickname">"${c.nickname}"</div>
                        <button class="btn-vote-card">VOTE</button>
                    </div>
                </div>
            `
    )
    .join("");
}

function openHowToVote() {
  document.getElementById("howToVoteModal").style.display = "flex";
}

function closeHowToVote() {
  document.getElementById("howToVoteModal").style.display = "none";
}

function openTermsModal() {
  document.getElementById("termsModal").style.display = "flex";
}

function closeTermsModal() {
  document.getElementById("termsModal").style.display = "none";
}

window.onclick = function (event) {
  const howTo = document.getElementById("howToVoteModal");
  const vote = document.getElementById("voteModal");
  const profile = document.getElementById("profileModal");

  if (event.target == howTo) closeHowToVote();
  if (event.target == vote) closeModal();
  if (event.target == profile) closeProfileModal();
};

function openModal(id) {
  const c = contestants.find((x) => x.id === id);
  currentContestantId = id;

  document.getElementById("modalImg").src = c.img;
  document.getElementById("modalName").innerText = c.nickname;
  document.getElementById(
    "modalNo"
  ).innerText = `Code: M7Q-${c.id} | ${c.name}`;

  document.getElementById("slipFile").value = "";
  document.getElementById("uploadLabel").innerHTML =
    '<i class="fas fa-cloud-upload-alt"></i> แตะเพื่อแนบสลิป';
  document.getElementById("uploadLabel").style.borderColor = "#d4af37";
  document.getElementById("uploadLabel").style.color = "#d4af37";
  document.getElementById("status").innerText = "";

  document.getElementById("voteModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("voteModal").style.display = "none";
}

window.onclick = function (event) {
  if (event.target == document.getElementById("voteModal")) {
    closeModal();
  }
  if (event.target == document.getElementById("termsModal")) {
    closeTermsModal();
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
      alert("ไม่สามารถคัดลอกได้ กรุณาจดเลขบัญชีแทนนะคะ");
    }
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
    alert("ไม่สามารถคัดลอกได้ กรุณาจดเลขบัญชีแทนนะคะ");
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
    document.getElementById(
      "uploadLabel"
    ).innerHTML = `<i class="fas fa-check"></i> แนบแล้ว: ${file.name.substring(
      0,
      15
    )}...`;
    document.getElementById("uploadLabel").style.borderColor = "#00ff00";
    document.getElementById("uploadLabel").style.color = "#00ff00";
  }
}

async function submitVote() {
  const fileInput = document.getElementById("slipFile");
  const status = document.getElementById("status");
  const btn = document.getElementById("btnConfirm");

  if (!fileInput.files[0]) {
    alert("กรุณาแนบสลิปก่อนยืนยันค่ะ");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังตรวจสอบ...';

  const reader = new FileReader();
  reader.readAsDataURL(fileInput.files[0]);
  reader.onload = async () => {
    const base64String = reader.result.replace("data:", "").replace(/^.+,/, "");

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64String,
          contestantNo: currentContestantId,
          lineUserId: userProfile.userId,
          lineDisplayName: userProfile.displayName,
        }),
      });
      const result = await response.json();

      if (result.success) {
        status.innerHTML = `<span style="color:#d4af37">✅ สำเร็จ! +${result.points} คะแนน</span>`;
        alert(`ขอบคุณค่ะ! โหวตสำเร็จ ${result.points} คะแนน`);
        closeModal();
      } else {
        status.innerHTML = `<span style="color:red">❌ ${result.message}</span>`;
        btn.innerHTML = "ยืนยันโหวต";
      }
    } catch (err) {
      status.innerText = "เกิดข้อผิดพลาดในการเชื่อมต่อ";
      btn.innerHTML = "ยืนยันโหวต";
    } finally {
      btn.disabled = false;
    }
  };
}
