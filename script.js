// script.js

// Ketika DOM telah siap, susun struktur halaman
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");

  // --- Header ---
  const header = document.createElement("header");
  const logoContainer = document.createElement("div");
  logoContainer.className = "logo-container";
  
  // Ganti 'logo.png' dengan URL logo Anda, atau hapus elemen img jika tidak diperlukan
  const logoImg = document.createElement("img");
  logoImg.src = "Logoo.png";
  logoImg.alt = "Logo";

  const title = document.createElement("h1");
  title.textContent = "TaniHarjo";

  logoContainer.appendChild(logoImg);
  logoContainer.appendChild(title);
  header.appendChild(logoContainer);
  root.appendChild(header);

  // --- Konten Utama ---
  const main = document.createElement("main");

  // Kontainer sensor untuk menampilkan nilai sensor
  const sensorContainer = document.createElement("div");
  sensorContainer.className = "sensor-container";

  // Tambahan teks untuk judul monitoring
  const monitoringTitle = document.createElement("p");
  monitoringTitle.className = "monitoring-title";
  monitoringTitle.textContent = "Sistem Monitoring Kebun Gizi";

  // Nilai pH
  const pHLabel = document.createElement("p");
  pHLabel.textContent = "pH:";
  const pHValue = document.createElement("div");
  pHValue.id = "phValue";
  pHValue.className = "circle";
  pHValue.textContent = "--";

  // Nilai kelembapan
  const moistureLabel = document.createElement("p");
  moistureLabel.textContent = "Kelembapan (%):";
  const moistureValue = document.createElement("div");
  moistureValue.id = "moistureValue";
  moistureValue.className = "circle";
  moistureValue.textContent = "--";

  sensorContainer.appendChild(monitoringTitle);
  sensorContainer.appendChild(pHLabel);
  sensorContainer.appendChild(pHValue);
  sensorContainer.appendChild(moistureLabel);
  sensorContainer.appendChild(moistureValue);

  // Kontainer grafik
  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";
  const canvas = document.createElement("canvas");
  canvas.id = "sensorChart";
  chartContainer.appendChild(canvas);

  // Tambahkan sensor container dan chart container ke main
  main.appendChild(sensorContainer);
  main.appendChild(chartContainer);
  
  root.appendChild(main);

  // Inisialisasi grafik
  initChart();
  // Ambil data sensor saat halaman termuat dan update tiap 1 menit (60000 ms)
  fetchSensorData();
  setInterval(fetchSensorData, 60000);
});

// --- Inisialisasi Grafik --- //
let sensorChart;
const chartData = {
  labels: [],
  datasets: [
    {
      label: 'pH',
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      yAxisID: 'y1',
      fill: false,
      tension: 0.1,
    },
    {
      label: 'Kelembapan (%)',
      data: [],
      borderColor: 'rgba(192, 75, 75, 1)',
      yAxisID: 'y2',
      fill: false,
      tension: 0.1,
    }
  ]
};

function initChart() {
  const ctx = document.getElementById("sensorChart").getContext("2d");
  const now = new Date();
  sensorChart = new Chart(ctx, {
    type: "line",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false, // Agar aspek rasio bisa disesuaikan oleh CSS
      scales: {
        x: {
          type: "time",
          time: {
            unit: "hour",
            tooltipFormat: "dd MMM yyyy, HH:mm"
          },
          // Set rentang waktu 24 jam terakhir
          min: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          max: now,
          title: {
            display: true,
            text: "Waktu"
          },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 10
          }
        },
        y1: {
          type: "linear",
          position: "left",
          title: {
            display: true,
            text: "pH"
          },
          suggestedMin: 0,
          suggestedMax: 14
        },
        y2: {
          type: "linear",
          position: "right",
          title: {
            display: true,
            text: "Kelembapan (%)"
          },
          grid: {
            drawOnChartArea: false
          },
          suggestedMin: 0,
          suggestedMax: 100
        }
      }
    }
  });
}

// --- Fungsi Mengambil Data dari Blynk --- //
function fetchSensorData() {
  // Kredensial dan endpoint API Blynk
  const token = "M-MsQC9qCxhnBiJiMTED8bCRYgAsetqO";
  const apiUrlPH = `https://blynk.cloud/external/api/get?token=${token}&pin=V1`;
  const apiUrlMoisture = `https://blynk.cloud/external/api/get?token=${token}&pin=V0`;

  Promise.all([
    fetch(apiUrlPH).then(response => response.text()),
    fetch(apiUrlMoisture).then(response => response.text())
  ])
    .then(([phText, moistureText]) => {
      const phValueNum = parseFloat(phText);
      const moistureValueNum = parseFloat(moistureText);
      const now = new Date();

      // Perbarui nilai sensor pada halaman
      document.getElementById("phValue").textContent = isNaN(phValueNum) ? "--" : phValueNum.toFixed(2);
      document.getElementById("moistureValue").textContent = isNaN(moistureValueNum) ? "--" : moistureValueNum;

      // Tambahkan data ke grafik
      chartData.labels.push(now);
      chartData.datasets[0].data.push(phValueNum);
      chartData.datasets[1].data.push(moistureValueNum);

      // Hapus data yang lebih lama dari 24 jam
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      while (chartData.labels.length > 0 && chartData.labels[0] < cutoff) {
          chartData.labels.shift();
          chartData.datasets[0].data.shift();
          chartData.datasets[1].data.shift();
      }

      // Perbarui rentang sumbu x agar mencakup 24 jam terakhir
      sensorChart.options.scales.x.min = cutoff;
      sensorChart.options.scales.x.max = now;

      sensorChart.update();
    })
    .catch(error => {
      console.error("Error fetching sensor data:", error);
    });
}
