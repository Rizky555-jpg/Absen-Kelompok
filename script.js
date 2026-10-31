const API = window.location.origin + '/api';

function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' });
  document.getElementById('date').textContent = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' });
}
setInterval(updateClock, 1000);
updateClock();

document.getElementById('bukti').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const preview = document.getElementById('preview');
  preview.innerHTML = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { preview.innerHTML = `<img src="${ev.target.result}" />`; };
  reader.readAsDataURL(file);
});

document.getElementById('formAbsen').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btnSubmit');
  btn.disabled = true;
  btn.innerHTML = 'Memproses... <i class="fa-solid fa-spinner fa-spin"></i>';

  const formData = new FormData();
  formData.append('nama', document.getElementById('nama').value);
  const ket = document.querySelector('input[name="keterangan"]:checked').value;
  formData.append('keterangan', ket);
  formData.append('bukti', document.getElementById('bukti').files[0]);

  try {
    const res = await fetch(`${API}/absen`, { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const waAdmin = document.getElementById('waAdmin').value;
    const nama = document.getElementById('nama').value;
    
    const pesan = `*ABSENSI KELOMPOK*%0A%0A` +
                  `*Nama:* ${nama}%0A` +
                  `*Status:* ${ket}%0A` +
                  `*Waktu:* ${new Date().toLocaleString('id-ID')}%0A%0A` +
                  `_Bukti foto sudah tersimpan di web._`;

    const waUrl = `https://wa.me/${waAdmin}?text=${pesan}`;

    alert(`✅ Absen ${nama} berhasil!\n\nKamu akan diarahkan ke WhatsApp untuk konfirmasi.`);
    
    window.open(waUrl, '_blank');

    document.getElementById('formAbsen').reset();
    document.getElementById('preview').innerHTML = '';
    loadAbsen();
  } catch (err) {
    alert('❌ Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>Kirim & Ke WhatsApp</span> <i class="fa-brands fa-whatsapp"></i>';
  }
});

let allData = [];
async function loadAbsen() {
  try {
    const res = await fetch(`${API}/absen`);
    allData = await res.json();
    renderAbsen(allData);
    document.getElementById('total').textContent = allData.length;
  } catch (err) { console.error(err); }
}

function renderAbsen(data) {
  const container = document.getElementById('dataAbsen');
  if (data.length === 0) {
    container.innerHTML = '<div class="empty">Belum ada data absensi.</div>';
    return;
  }
  container.innerHTML = data.map((d) => {
    const buktiHtml = d.bukti_file ? `<img src="/uploads/${d.bukti_file}" />` : '';
    return `
      <div class="item">
        ${buktiHtml}
        <div class="item-info">
          <h4>${d.nama}</h4>
          <p><span class="status ${d.keterangan}">${d.keterangan}</span> • 🕐 ${d.jam}</p>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  renderAbsen(allData.filter(d => d.nama.toLowerCase().includes(q)));
});

loadAbsen();
